#!/usr/bin/env python3
"""
Startup script for Cynerra VARM Backend
"""

import os
import sys
import subprocess
from pathlib import Path

def main():
    # Get the directory where this script is located
    script_dir = Path(__file__).parent.absolute()
    backend_dir = script_dir
    
    print(f"🚀 Starting Cynerra VARM Backend from: {backend_dir}")
    
    # Change to backend directory
    os.chdir(backend_dir)
    
    print(f"📁 Current directory: {os.getcwd()}")
    
    # Check if app module exists
    app_dir = backend_dir / "app"
    if not app_dir.exists():
        print(f"❌ App directory not found at: {app_dir}")
        return False
    
    main_file = app_dir / "main.py"
    if not main_file.exists():
        print(f"❌ Main file not found at: {main_file}")
        return False
    
    print("✅ App structure looks good")
    
    # Test import first
    print("🔍 Testing import...")
    try:
        import app.main
        print("✅ Import successful")
    except Exception as e:
        print(f"❌ Import failed: {e}")
        return False
    
    # Start uvicorn
    print("🌟 Starting FastAPI server...")
    try:
        cmd = [
            sys.executable, "-m", "uvicorn", 
            "app.main:app", 
            "--reload", 
            "--host", "localhost", 
            "--port", "8000"
        ]
        
        print(f"Running command: {' '.join(cmd)}")
        subprocess.run(cmd, check=True)
        
    except KeyboardInterrupt:
        print("\n👋 Server stopped by user")
    except subprocess.CalledProcessError as e:
        print(f"❌ Server failed to start: {e}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        return False
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)