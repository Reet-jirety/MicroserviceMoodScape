const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');

const app = express();
const port = 8000;

app.use(bodyParser.json());

// Configure multer to store uploaded files in memory
const upload = multer({ storage: multer.memoryStorage() });

app.get('/', (req, res) => {
    res.send('Welcome to the Emotion Detection Microservice!');
});

// GET: Detect emotion from text query parameter
app.get('/detect-emotion', (req, res) => {
    const text = req.query.text || 'No text provided';
    const detectedEmotion = detectEmotion(text);
    res.json({ emotion: detectedEmotion, text, source: 'text' });
});

// POST: Handle both text and image inputs
app.post('/detect-emotion', upload.single('image'), async (req, res) => {
    if (req.file) {
        const startTime = Date.now();
        try {
            console.log(`Image received: ${req.file.originalname}, Size: ${req.file.size} bytes`);
            const formData = new FormData();
            formData.append('image', req.file.buffer, { filename: req.file.originalname });
            
            const response = await axios.post('http://localhost:6000/detect-emotion', formData, {
                headers: formData.getHeaders(),
                timeout: 10000, // 10-second timeout to prevent hanging
            });
            
            const emotion = response.data.emotion;
            const endTime = Date.now();
            const processingTime = (endTime - startTime) / 1000;
            console.log(`Detected emotion from image: ${emotion}, Time: ${processingTime.toFixed(2)}s`);
            res.json({ emotion, source: 'image', processingTime });
        } catch (error) {
            console.error('Error detecting emotion from image:', error.message);
            res.status(500).json({ error: 'Error detecting emotion from image' });
        }
    } else if (req.body.text) {
        const text = req.body.text || 'No text provided';
        const detectedEmotion = detectEmotion(text);
        res.json({ emotion: detectedEmotion, text, source: 'text' });
    } else {
        res.status(400).json({ error: 'No image or text provided' });
    }
});

// Simple emotion detection logic for text
function detectEmotion(text) {
    if (!text) return 'neutral';
    
    const lowerText = text.toLowerCase();
    if (lowerText.includes('happy') || lowerText.includes('joy') || lowerText.includes('excited')) {
        return 'happy';
    } else if (lowerText.includes('sad') || lowerText.includes('depressed') || lowerText.includes('unhappy')) {
        return 'sad';
    } else if (lowerText.includes('angry') || lowerText.includes('mad') || lowerText.includes('furious')) {
        return 'angry';
    } else if (lowerText.includes('fear') || lowerText.includes('scared') || lowerText.includes('afraid')) {
        return 'fearful';
    } else {
        return 'neutral';
    }
}

app.listen(port, () => {
    console.log(`Emotion detection service running on port ${port}`);
});