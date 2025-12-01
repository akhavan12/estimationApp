#!/usr/bin/env python3
"""
Script to start the Flask server on an available port.
Checks if port 5000 is in use and automatically tries the next available port.
"""

import os
import sys
import socket
from pathlib import Path

# Get the project directory
SCRIPT_DIR = Path(__file__).parent.absolute()
PROJECT_DIR = SCRIPT_DIR.parent

# Add project directory to Python path
sys.path.insert(0, str(PROJECT_DIR))


def is_port_in_use(port):
    """Check if a port is currently in use."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        try:
            s.bind(('127.0.0.1', port))
            return False  # Port is available
        except OSError:
            return True  # Port is in use


def find_available_port(start_port=5000, max_port=5100):
    """Find the first available port starting from start_port."""
    for port in range(start_port, max_port + 1):
        if not is_port_in_use(port):
            return port
    raise RuntimeError(f"Could not find an available port between {start_port} and {max_port}")


def main():
    """Main function to start the Flask server."""
    # Find an available port
    start_port = 5000
    try:
        port = find_available_port(start_port)
        if port != start_port:
            print(f"⚠ Port {start_port} is in use, using port {port} instead")
        else:
            print(f"✓ Port {port} is available")
    except RuntimeError as e:
        print(f"Error: {e}")
        sys.exit(1)
    
    # Set the port as an environment variable
    os.environ['FLASK_PORT'] = str(port)
    
    # Change to project directory
    os.chdir(PROJECT_DIR)
    
    # Check for virtual environment
    venv_paths = [PROJECT_DIR / 'venv', PROJECT_DIR / '.venv']
    has_venv = any(path.exists() for path in venv_paths)
    
    if not has_venv:
        print("\n⚠ Warning: No virtual environment found.")
        print("Consider creating one:")
        print("  python3 -m venv venv")
        print("  source venv/bin/activate  # On macOS/Linux")
        print("  pip install -r requirements.txt\n")
    
    # Import and run Flask app
    try:
        from app import app
        
        print(f"\n🚀 Starting Flask server on port {port}...")
        print(f"📡 API will be available at: http://localhost:{port}")
        print(f"❤️  Health check: http://localhost:{port}/api/health")
        print("\nPress Ctrl+C to stop the server\n")
        
        app.run(debug=True, port=port, host='0.0.0.0')
    except ImportError as e:
        print(f"Error: Could not import Flask app. Make sure dependencies are installed.")
        print(f"Run: pip install -r requirements.txt")
        sys.exit(1)
    except Exception as e:
        print(f"Error starting server: {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()

