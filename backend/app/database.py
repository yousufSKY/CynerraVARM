"""
Firebase Database Configuration
Firestore integration for Cynerra VARM
"""

import os
import logging
from typing import Generator, Any, Optional
import firebase_admin
from firebase_admin import credentials, firestore
from google.cloud.firestore_v1.base_client import BaseClient

from app.config import settings

logger = logging.getLogger(__name__)

class FirebaseManager:
    """
    Firebase database manager for Firestore integration
    """
    
    def __init__(self):
        self.db: Optional[BaseClient] = None
        self.connected = False
        self._initialize_firebase()
    
    def _initialize_firebase(self):
        """
        Initialize Firebase Admin SDK with credentials
        """
        try:
            # Check if Firebase is already initialized
            if firebase_admin._apps:
                app = firebase_admin.get_app()
                self.db = firestore.client(app)
                self.connected = True
                logger.info("✅ Firebase already initialized, using existing connection")
                return
            
            # Get credentials from environment
            if not all([
                settings.FIREBASE_PROJECT_ID,
                settings.FIREBASE_PRIVATE_KEY_ID,
                settings.FIREBASE_PRIVATE_KEY,
                settings.FIREBASE_CLIENT_EMAIL,
                settings.FIREBASE_CLIENT_ID
            ]):
                logger.error("❌ Firebase credentials missing in environment variables")
                return
            
            # Create credentials object
            cred_dict = {
                "type": "service_account",
                "project_id": settings.FIREBASE_PROJECT_ID,
                "private_key_id": settings.FIREBASE_PRIVATE_KEY_ID,
                "private_key": settings.FIREBASE_PRIVATE_KEY.replace('\\n', '\n'),
                "client_email": settings.FIREBASE_CLIENT_EMAIL,
                "client_id": settings.FIREBASE_CLIENT_ID,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
                "client_x509_cert_url": f"https://www.googleapis.com/robot/v1/metadata/x509/{settings.FIREBASE_CLIENT_EMAIL.replace('@', '%40')}"
            }
            
            # Initialize Firebase
            cred = credentials.Certificate(cred_dict)
            firebase_admin.initialize_app(cred)
            
            # Initialize Firestore client
            self.db = firestore.client()
            self.connected = True
            
            logger.info("✅ Firebase Admin SDK initialized successfully")
            logger.info(f"📋 Project ID: {settings.FIREBASE_PROJECT_ID}")
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize Firebase: {str(e)}")
            self.connected = False
            self.db = None
    
    def get_connection(self) -> Optional[BaseClient]:
        """
        Get Firestore database connection
        """
        if not self.connected or self.db is None:
            logger.warning("⚠️  Firebase not connected, attempting to reconnect...")
            self._initialize_firebase()
        
        return self.db
    
    def test_connection(self) -> bool:
        """
        Test Firebase/Firestore connectivity
        """
        try:
            if not self.connected or self.db is None:
                return False
            
            # Try to read from a test collection
            test_ref = self.db.collection('_health_check').document('test')
            test_ref.set({'timestamp': firestore.SERVER_TIMESTAMP, 'status': 'healthy'})
            
            # Read it back
            doc = test_ref.get()
            if doc.exists:
                # Clean up test document
                test_ref.delete()
                logger.info("✅ Firebase connection test successful")
                return True
            else:
                logger.error("❌ Firebase connection test failed - document not found")
                return False
                
        except Exception as e:
            logger.error(f"❌ Firebase connection test failed: {str(e)}")
            return False
    
    def create_collections(self):
        """
        Initialize required collections for VARM
        """
        try:
            if not self.connected or self.db is None:
                logger.error("❌ Cannot create collections - Firebase not connected")
                return False
            
            collections = ['assets', 'risk_assessments', 'scans', 'reports']
            
            for collection_name in collections:
                # Create a system document to ensure collection exists
                doc_ref = self.db.collection(collection_name).document('_system')
                doc_ref.set({
                    'created_at': firestore.SERVER_TIMESTAMP,
                    'description': f'System document for {collection_name} collection',
                    'version': '1.0'
                })
                logger.info(f"✅ Collection '{collection_name}' initialized")
            
            logger.info("✅ All VARM collections initialized successfully")
            return True
            
        except Exception as e:
            logger.error(f"❌ Failed to create collections: {str(e)}")
            return False

    def create_document(self, collection_name: str, doc_id: str, data: dict):
        """Create a document in the specified collection"""
        if not self.db:
            raise Exception("No database connection available")
        
        doc_ref = self.db.collection(collection_name).document(doc_id)
        doc_ref.set(data)
        return doc_ref

    def get_document(self, collection_name: str, doc_id: str):
        """Get a document from the specified collection"""
        if not self.db:
            raise Exception("No database connection available")
        
        doc_ref = self.db.collection(collection_name).document(doc_id)
        doc = doc_ref.get()
        return doc.to_dict() if doc.exists else None

    def update_document(self, collection_name: str, doc_id: str, data: dict):
        """Update a document in the specified collection"""
        if not self.db:
            raise Exception("No database connection available")
        
        doc_ref = self.db.collection(collection_name).document(doc_id)
        doc_ref.update(data)
        return doc_ref

    def delete_document(self, collection_name: str, doc_id: str):
        """Delete a document from the specified collection"""
        if not self.db:
            raise Exception("No database connection available")
        
        doc_ref = self.db.collection(collection_name).document(doc_id)
        doc_ref.delete()
        return True

# Global Firebase manager instance
firebase_manager = FirebaseManager()

def get_db() -> Generator[BaseClient, None, None]:
    """
    Dependency function to get Firestore database connection.
    Used with FastAPI's Depends() to inject database sessions into endpoints.
    """
    db = firebase_manager.get_connection()
    try:
        if db is None:
            raise Exception("Firebase database connection not available")
        yield db
    except Exception as e:
        logger.error(f"Database session error: {str(e)}")
        raise
    finally:
        # Firestore connections are managed automatically
        pass

def init_db():
    """
    Initialize Firebase database and create required collections.
    This function is called when the application starts.
    """
    try:
        if not firebase_manager.connected:
            raise Exception("Firebase not connected")
        
        # Test connection
        if not firebase_manager.test_connection():
            raise Exception("Firebase connection test failed")
        
        # Create collections
        if not firebase_manager.create_collections():
            raise Exception("Failed to create collections")
        
        logger.info("✅ Firebase database initialized successfully")
        
    except Exception as e:
        logger.error(f"❌ Failed to initialize Firebase database: {str(e)}")
        raise

def test_db_connection():
    """
    Test Firebase database connectivity.
    """
    return firebase_manager.test_connection()