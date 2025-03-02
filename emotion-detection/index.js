const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 8000;

app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('Welcome to the Emotion Detection Microservice!');
});

// Support both GET and POST requests for detect-emotion
app.get('/detect-emotion', (req, res) => {
    const text = req.query.text || 'No text provided';
    const detectedEmotion = detectEmotion(text);
    res.json({ emotion: detectedEmotion, text });
});

app.post('/detect-emotion', (req, res) => {
    const text = req.body.text || 'No text provided';
    const detectedEmotion = detectEmotion(text);
    res.json({ emotion: detectedEmotion, text });
});

// Simple emotion detection logic
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