const http = require('http');
const express = require('express');
const socketIo = require('socket.io');
const { Kafka } = require('kafkajs');
const { createClient } = require('redis');
const { createAdapter } = require('@socket.io/redis-adapter');
const fs = require('fs');
const path = require('path');
const csvParser = require('csv-parser');

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO with CORS settings.
const io = socketIo(server, {
  cors: {
    origin: '*', // Adjust as needed
    methods: ['GET', 'POST']
  }
});

// Initialize Redis clients for Socket.IO adapter.
const redisUrl = 'redis://redis:6379'; // Use service name from docker-compose.
const pubClient = createClient({ url: redisUrl });
const subClient = pubClient.duplicate();
Promise.all([pubClient.connect(), subClient.connect()])
  .then(() => {
    io.adapter(createAdapter(pubClient, subClient));
    console.log('Socket.IO Redis adapter connected.');
  })
  .catch(console.error);

// Redis client for state storage.
const redisClient = createClient({ url: redisUrl });
redisClient.connect().catch(console.error);

// Kafka configuration.
const kafka = new Kafka({
  clientId: 'server',
  brokers: ['kafka:9092']
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'server-group' });

// Load the song data from the CSV file
const songData = [];
fs.createReadStream(path.join(__dirname, './data/data_moods.csv'))
  .pipe(csvParser())
  .on('data', (row) => {
    songData.push(row);
  })
  .on('end', () => {
    console.log('Song data loaded successfully.');
  });

// Function to recommend songs based on emotion
function recommendSongs(emotion) {
  // Map emotions to moods
  let mood;
  if (emotion === 'Angry') mood = 'Energetic';
  else if (emotion === 'Disgust') mood = 'Calm';
  else if (emotion === 'Fear') mood = 'Energetic';
  else if (emotion === 'Happy') mood = 'Happy';
  else if (emotion === 'Neutral') mood = 'Calm';
  else if (emotion === 'Sad') mood = 'Sad';
  else if (emotion === 'Surprise') mood = 'Energetic';
  else mood = 'Calm';

  // Filter songs by mood
  const filteredSongs = songData.filter((song) => song.mood === mood);

  // Select up to 5 random songs
  const recommendations = filteredSongs.length > 5
    ? filteredSongs.sort(() => 0.5 - Math.random()).slice(0, 5)
    : filteredSongs;

  return recommendations;
}

async function runKafka() {
  await producer.connect();
  await consumer.connect();
  await consumer.subscribe({ topic: 'emotionResult', fromBeginning: true });

  consumer.run({
    eachMessage: async ({ message }) => {
      const result = JSON.parse(message.value.toString());
      console.log(`Received message from Kafka: ${result}`);
      
      const { socketId, emotion } = result;
      const redisKey = `emotion:${socketId}`;
      console.log(`Received emotion result for socket ${socketId}:`, emotion);
      
      // Increment the count for this emotion.
      await redisClient.hIncrBy(redisKey, emotion, 1);
      // Increment a total counter.
      await redisClient.hIncrBy(redisKey, 'total', 1);

      // Retrieve the total count.
      const totalCount = await redisClient.hGet(redisKey, 'total');
      if (parseInt(totalCount) === 15) {
        // Get all counts.
        const emotionCounts = await redisClient.hGetAll(redisKey);
        delete emotionCounts.total;

        // Compute majority emotion.
        let majorityEmotion = null;
        let maxCount = 0;
        for (const [emo, countStr] of Object.entries(emotionCounts)) {
          const count = parseInt(countStr);
          if (count > maxCount) {
            maxCount = count;
            majorityEmotion = emo;
          }
        }

        console.log(`Final emotion for ${socketId}: ${majorityEmotion}`);

        // Recommend songs based on the majority emotion
        const recommendedSongs = recommendSongs(majorityEmotion);

        // Emit final aggregated emotion and recommended songs to the client
        io.to(socketId).emit('emotion_result', {
          emotion: majorityEmotion,
          recommendations: recommendedSongs,
        });

        // Instruct the client to stop sending data
        io.to(socketId).emit('stopSendingData');

        // Clear stored state
        await redisClient.del(redisKey);
      }
    }
  });
}

runKafka().catch(console.error);

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('detect_emotion_stream', async (data) => {
    // Wrap face data with the socket id.
    const payload = {
      socketId: socket.id,
      faceData: data
    };

    console.log(`Sending face data to Kafka for socket ${socket.id}:`, payload);
    

    await producer.send({
      topic: 'faceData',
      messages: [{ value: JSON.stringify(payload) }]
    });
  });

  socket.on('disconnect', async () => {
    console.log('Client disconnected:', socket.id);
    const redisKey = `emotion:${socket.id}`;
    await redisClient.del(redisKey);
  });
});

const PORT = process.env.PORT || 8020;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
