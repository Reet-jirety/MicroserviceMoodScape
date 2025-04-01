const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'emotion-service',
  brokers: ['kafka:9092']
});

const consumer = kafka.consumer({ groupId: 'emotion-group' });
const producer = kafka.producer();

async function runEmotionService() {
  await consumer.connect();
  await producer.connect();
  await consumer.subscribe({ topic: 'faceData', fromBeginning: true });

  consumer.run({
    eachMessage: async ({ message }) => {
      const payload = JSON.parse(message.value.toString());
      const { socketId, faceData } = payload;
      console.log(`Received face data for socket ${socketId}:`, faceData);

      // Dummy emotion detection: randomly select an emotion.
      const emotions = ['Happy', 'Sad', 'Angry', 'Surprised', 'Neutral'];
      const detectedEmotion = emotions[Math.floor(Math.random() * emotions.length)];
      console.log(`Detected emotion for ${socketId}: ${detectedEmotion}`);

      const resultPayload = { socketId, emotion: detectedEmotion };

      // Send the result to the 'emotionResult' topic.
      await producer.send({
        topic: 'emotionResult',
        messages: [{ value: JSON.stringify(resultPayload) }]
      });
    }
  });
}

runEmotionService().catch(console.error);
