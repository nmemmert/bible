#!/usr/bin/env python
"""
Bible Study Hub - Enhanced Startup Script
Run this to start the Bible study application with all new features
"""
import os
from main import create_app

if __name__ == "__main__":
    app = create_app()
    
    # Get port from environment or default to 5000
    port = int(os.environ.get('PORT', 5000))
    
    # Run in debug mode if DEBUG is set
    debug = os.environ.get('DEBUG', 'False').lower() in ('true', '1', 'yes')
    
    print("="*60)
    print("🔥 BIBLE STUDY HUB - Enhanced Edition 🔥")
    print("="*60)
    print("📖 Features available:")
    print("   • User Registration & Authentication")
    print("   • Personal Notes & Annotations") 
    print("   • Bookmarks & Highlights")
    print("   • Study Guide Builder")
    print("   • Greek & Hebrew Lexicon")
    print("   • Word Studies with Strong's Numbers")
    print("   • All Original Bible Versions")
    print("="*60)
    print(f"🚀 Starting server on http://localhost:{port}")
    print("="*60)
    
    try:
        app.run(host='0.0.0.0', port=port, debug=debug)
    except KeyboardInterrupt:
        print("\n👋 Thanks for studying God's Word!")
    except Exception as e:
        print(f"\n❌ Error starting server: {e}")
        print("💡 Try running with DEBUG=true for more details")