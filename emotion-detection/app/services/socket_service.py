from flask_socketio import emit
from emotion_detector import EmotionDetector
import logging

class SocketService:
    def __init__(self, socketio):
        self.socketio = socketio
        self.detector = EmotionDetector()
        self._register_handlers()
        logging.basicConfig(level=logging.DEBUG)
        self.logger = logging.getLogger(__name__)

    def _register_handlers(self):
        """Register all socket event handlers"""
        @self.socketio.on('connect')
        def handle_connect():
            self.logger.info('Client connected')
            return {'status': 'connected'}

        @self.socketio.on('disconnect')
        def handle_disconnect():
            self.logger.info('Client disconnected')

        @self.socketio.on('detect_emotion_stream')
        def handle_emotion_stream(image_data):
            self.logger.debug('Received image data for emotion detection')
            try:
                result = self.detector.process_base64_image(image_data)
                self.logger.debug(f'Emotion detection result: {result}')
                if 'error' in result:
                    emit('emotion_result', {'error': result['error']})
                else:
                    emit('emotion_result', {'emotion': result['emotion']})
            except Exception as e:
                self.logger.error(f'Error in emotion detection: {str(e)}')
                emit('emotion_result', {'error': str(e)}) 

        @self.socketio.on('message')
        def handle_message(data):
            self.logger.debug(f'Received message: {data}')
            emit('message_response', {'message': 'Message received'})
