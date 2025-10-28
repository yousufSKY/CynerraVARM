"""
Clerk JWT Authentication Middleware
Validates Clerk-issued JWT tokens for API authentication
"""

import jwt
import httpx
import json
from typing import Optional, Dict, Any
from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
import logging

from app.config import settings

logger = logging.getLogger(__name__)

class ClerkAuthMiddleware(BaseHTTPMiddleware):
    """
    Middleware to validate Clerk JWT tokens.
    Extracts and validates JWT from Authorization header or cookies.
    """
    
    def __init__(self, app):
        super().__init__(app)
        self.public_paths = {
            "/",
            "/health",
            "/docs",
            "/redoc",
            "/openapi.json"
        }
        self.clerk_jwks: Optional[Dict[str, Any]] = None
    
    async def dispatch(self, request: Request, call_next):
        # Skip authentication for public paths
        if request.url.path in self.public_paths:
            return await call_next(request)
        
        # Skip authentication for OPTIONS requests (CORS preflight)
        if request.method == "OPTIONS":
            return await call_next(request)
        
        try:
            # Extract JWT token
            token = self.extract_token(request)
            if not token:
                logger.warning("No JWT token found in request")
                return JSONResponse(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    content={"error": "Authentication required", "success": False}
                )
            
            # Validate the token
            user_data = await self.validate_token(token)
            if not user_data:
                logger.warning("JWT token validation failed")
                return JSONResponse(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    content={"error": "Invalid or expired token", "success": False}
                )
            
            # Add user data to request state
            request.state.user = user_data
            
            # Continue with the request
            response = await call_next(request)
            return response
            
        except Exception as e:
            logger.error(f"Authentication error: {str(e)}")
            return JSONResponse(
                status_code=status.HTTP_401_UNAUTHORIZED,
                content={"error": "Authentication failed", "success": False}
            )
    
    def extract_token(self, request: Request) -> Optional[str]:
        """
        Extract JWT token from Authorization header or cookies.
        """
        # Try Authorization header first
        authorization = request.headers.get("Authorization")
        logger.info(f"Authorization header: {authorization[:50] if authorization else 'None'}...")
        
        if authorization and authorization.startswith("Bearer "):
            token = authorization.split("Bearer ")[1]
            logger.info(f"Found Bearer token (length: {len(token)})")
            return token
        
        # Try session cookie (Clerk's default cookie name)
        session_token = request.cookies.get("__session")
        if session_token:
            logger.info(f"Found session cookie (length: {len(session_token)})")
            return session_token
        
        logger.warning("No token found in Authorization header or cookies")
        return None
        auth_token = request.cookies.get("auth_token")
        if auth_token:
            return auth_token
        
        return None
    
    async def validate_token(self, token: str) -> Optional[Dict[str, Any]]:
        """
        Validate JWT token using Clerk's public key.
        """
        try:
            # Get Clerk's public keys if not cached
            if not self.clerk_jwks:
                await self.fetch_clerk_jwks()
            
            # Decode JWT header to get key ID
            unverified_header = jwt.get_unverified_header(token)
            kid = unverified_header.get("kid")
            
            if not kid:
                logger.error("No key ID found in JWT header")
                return None
            
            # Find the public key
            public_key = self.get_public_key(kid)
            if not public_key:
                logger.error(f"Public key not found for key ID: {kid}")
                return None
            
            # Verify and decode the token
            payload = jwt.decode(
                token,
                public_key,
                algorithms=["RS256"],
                options={"verify_exp": True, "verify_aud": False}
            )
            
            # Extract user information
            user_data = {
                "user_id": payload.get("sub"),
                "email": payload.get("email"),
                "name": payload.get("name"),
                "session_id": payload.get("sid"),
                "issued_at": payload.get("iat"),
                "expires_at": payload.get("exp")
            }
            
            return user_data
            
        except jwt.ExpiredSignatureError:
            logger.error("JWT token has expired")
            return None
        except jwt.InvalidTokenError as e:
            logger.error(f"Invalid JWT token: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"Token validation error: {str(e)}")
            return None
    
    async def fetch_clerk_jwks(self):
        """
        Fetch Clerk's JSON Web Key Set (JWKS) for token validation.
        """
        try:
            # Construct JWKS URL from publishable key
            if not settings.CLERK_PUBLISHABLE_KEY:
                logger.error("CLERK_PUBLISHABLE_KEY not configured")
                return
            
            # Extract instance ID from publishable key
            # Format: pk_test_<encoded_data> or pk_live_<encoded_data>
            parts = settings.CLERK_PUBLISHABLE_KEY.split("_")
            if len(parts) < 3:
                logger.error("Invalid CLERK_PUBLISHABLE_KEY format")
                return
            
            # For newer Clerk keys, the domain is base64 encoded
            try:
                import base64
                encoded_part = parts[2]  # The part after pk_test_
                # Add padding if needed
                missing_padding = len(encoded_part) % 4
                if missing_padding:
                    encoded_part += '=' * (4 - missing_padding)
                
                decoded_bytes = base64.b64decode(encoded_part)
                domain = decoded_bytes.decode('utf-8').rstrip('$')  # Remove trailing $
                
                # Construct JWKS URL
                jwks_url = f"https://{domain}/.well-known/jwks.json"
                logger.info(f"Using JWKS URL: {jwks_url}")
                
            except Exception as decode_error:
                logger.error(f"Failed to decode publishable key: {decode_error}")
                # Fallback to default Clerk domain parsing
                instance_part = "_".join(parts[2:])
                domain_parts = instance_part.split(".")
                
                if len(domain_parts) < 2:
                    logger.error("Cannot extract domain from CLERK_PUBLISHABLE_KEY")
                    return
                
                domain = ".".join(domain_parts[1:])
                jwks_url = f"https://{domain}/.well-known/jwks.json"
            
            # Fetch JWKS
            async with httpx.AsyncClient() as client:
                response = await client.get(jwks_url)
                response.raise_for_status()
                self.clerk_jwks = response.json()
                logger.info("Successfully fetched Clerk JWKS")
                
        except Exception as e:
            logger.error(f"Failed to fetch Clerk JWKS: {str(e)}")
            # Fallback: use empty JWKS (will cause auth failures)
            self.clerk_jwks = {"keys": []}
    
    def get_public_key(self, kid: str) -> Optional[str]:
        """
        Get public key from JWKS by key ID.
        """
        if not self.clerk_jwks:
            return None
        
        for key in self.clerk_jwks.get("keys", []):
            if key.get("kid") == kid:
                # Convert JWK to PEM format
                return jwt.algorithms.RSAAlgorithm.from_jwk(json.dumps(key))
        
        return None

# Dependency to get current user from request
def get_current_user(request: Request) -> Dict[str, Any]:
    """
    FastAPI dependency to get current authenticated user.
    Use with Depends(get_current_user) in route handlers.
    """
    if not hasattr(request.state, "user") or not request.state.user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )
    return request.state.user