from flask import Flask, request, jsonify
import cv2
import numpy as np
from deepface import DeepFace
import time

app = Flask(__name__)

# Preload the DeepFace model at startup
print("Loading DeepFace model...")
start_time = time.time()
# Use a minimal dummy image to initialize the model
dummy_img = np.zeros((224, 224, 3), dtype=np.uint8)
DeepFace.analyze(dummy_img, actions=['emotion'], enforce_detection=False, detector_backend='opencv')
load_time = time.time() - start_time
print(f"DeepFace model loaded in {load_time:.2f} seconds.")

@app.route('/detect-emotion', methods=['POST'])
def detect_emotion():
    start_time = time.time()
    
    # Check if an image file is provided
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400
    
    file = request.files['image']
    filestr = file.read()
    npimg = np.frombuffer(filestr, np.uint8)
    img = cv2.imdecode(npimg, cv2.IMREAD_COLOR)
    decode_time = time.time()
    print(f"Image decoding: {decode_time - start_time:.2f}s")
    
    try:
        # Analyze emotion with preloaded model and faster opencv backend
        results = DeepFace.analyze(img, actions=['emotion'], enforce_detection=False, detector_backend='opencv')
        analyze_time = time.time()
        print(f"DeepFace analysis: {analyze_time - decode_time:.2f}s")
        
        if results and len(results) > 0:
            emotion = results[0]['dominant_emotion']
            total_time = time.time() - start_time
            print(f"Total processing time: {total_time:.2f}s")
            return jsonify({'emotion': emotion})
        else:
            return jsonify({'error': 'No face detected'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # For development, use Flask's server
    # For production, use: gunicorn -w 4 -b 0.0.0.0:8000 EmotionDetector:app
    app.run(host='0.0.0.0', port=8000, threaded=True)  # Threaded mode for better concurrency