import os
from app import create_app
from app.config.settings import config

app, socketio = create_app()

if __name__ == '__main__':
    # Get port from environment variable or default to 8000
    port = int(os.environ.get('PORT', 8000))
    
    # Get host from environment variable or default to 0.0.0.0
    host = os.environ.get('HOST', '0.0.0.0')
    
    # In production, use eventlet for better WebSocket performance
    socketio.run(
        app,
        host=host,
        port=port,
        debug=False,
        use_reloader=False,
        log_output=True,
        allow_unsafe_werkzeug=True  # Required for newer versions of Flask-SocketIO
    )