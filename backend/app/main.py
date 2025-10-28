"""
Cynerra VARM - FastAPI Backend
Entry point for the Vulnerability Assessment & Risk Management System
"""

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
import uvicorn
import logging

logger = logging.getLogger(__name__)

from app.config import settings
from app.database import test_db_connection, init_db
from app.routes import assets, risk, scan, reports
from app.utils.clerk_auth import ClerkAuthMiddleware

# Test database connection first
db_connected = test_db_connection()
if not db_connected:
    logger.warning("Database connection failed. Server will start but some endpoints may not work.")
    print("⚠️  Warning: Database connection failed. Server will start in limited mode.")

# Create database tables (only if connected)
if db_connected:
    try:
        init_db()
        print("✅ Database tables initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize database: {str(e)}")
        print(f"⚠️  Warning: Failed to initialize database: {str(e)}")
else:
    print("⚠️  Skipping database initialization due to connection failure")

# Initialize FastAPI app
app = FastAPI(
    title="Cynerra VARM API",
    description="Vulnerability Assessment & Risk Management System",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Add trusted host middleware
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=settings.ALLOWED_HOSTS
)

# Add Clerk authentication middleware
app.add_middleware(ClerkAuthMiddleware)

# Include API routes
app.include_router(assets.router, prefix="/api", tags=["Assets"])
app.include_router(risk.router, prefix="/api", tags=["Risk Assessment"])
app.include_router(scan.router, prefix="/api", tags=["Scanning"])
app.include_router(reports.router, prefix="/api", tags=["Reports"])

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "Cynerra VARM API is running",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    db_status = "firebase_not_configured"
    
    return {
        "status": "ready_for_firebase",
        "database": db_status,
        "database_type": "firebase_pending",
        "auth": "clerk_enabled",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="info"
    )