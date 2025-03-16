import cv2
import numpy as np
from deepface import DeepFace
import time
import base64

class EmotionDetector:
    def __init__(self):
        print("Loading DeepFace model...")
        start_time = time.time()
        # Use a minimal dummy image to initialize the model
        dummy_img = np.zeros((224, 224, 3), dtype=np.uint8)
        DeepFace.analyze(dummy_img, actions=['emotion'], enforce_detection=False, detector_backend='opencv')
        load_time = time.time() - start_time
        print(f"DeepFace model loaded in {load_time:.2f} seconds.")

    def process_image_file(self, file):
        """Process image from file upload"""
        start_time = time.time()
        
        filestr = file.read()
        npimg = np.frombuffer(filestr, np.uint8)
        img = cv2.imdecode(npimg, cv2.IMREAD_COLOR)
        decode_time = time.time()
        print(f"Image decoding: {decode_time - start_time:.2f}s")

        return self._analyze_image(img, start_time, decode_time)

    def process_base64_image(self, image_data):
        """Process image from base64 string"""
        try:
            # Decode base64 image
            encoded_data = image_data.split(',')[1]
            nparr = np.frombuffer(base64.b64decode(encoded_data), np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            return self._analyze_image(img)
        except Exception as e:
            return {'error': str(e)}

    def _analyze_image(self, img, start_time=None, decode_time=None):
        """Internal method to analyze the image"""
        if start_time is None:
            start_time = time.time()
        if decode_time is None:
            decode_time = time.time()

        # Resize image to 640x480 for faster processing
        img = cv2.resize(img, (640, 480), interpolation=cv2.INTER_AREA)
        resize_time = time.time()
        print(f"Image resizing: {resize_time - decode_time:.2f}s")
        
        try:
            # Analyze emotion with preloaded model and faster opencv backend
            results = DeepFace.analyze(img, actions=['emotion'], enforce_detection=False, detector_backend='opencv')
            analyze_time = time.time()
            print(f"DeepFace analysis: {analyze_time - decode_time:.2f}s")
            
            if results and len(results) > 0:
                emotion = results[0]['dominant_emotion']
                total_time = time.time() - start_time
                print(f"Total processing time: {total_time:.2f}s")
                return {'emotion': emotion}
            else:
                return {'error': 'No face detected'}
        except Exception as e:
            return {'error': str(e)} 