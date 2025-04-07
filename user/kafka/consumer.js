// kafka/consumer.js
const { Kafka } = require('kafkajs');
const { History } = require('../models/index');

const kafka = new Kafka({
  clientId: 'user-service',
  brokers: ['kafka:9092'], // Using the internal DNS name from docker-compose
  connectionTimeout: 5000, // Increase timeout if needed
  retry: {
    initialRetryTime: 300,
    retries: 10, // Increase the number of retries if Kafka is slow to start
  },
});

const consumer = kafka.consumer({ groupId: 'user-history-consumer' });

const startConsumer = async () => {
  try {
    await consumer.connect();
    console.log('Kafka consumer connected.');

    await consumer.subscribe({ topic: 'user.account.delete', fromBeginning: false });
    console.log('Subscribed to topic: user.account.delete');

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const payload = JSON.parse(message.value.toString());
          const { clerkId } = payload;
          console.log(`Processing deletion event for clerkId: ${clerkId}`);
          await History.destroy({ where: { userId: clerkId } });
          console.log(`History cleared for clerkId: ${clerkId}`);
        } catch (processingError) {
          console.error('Error processing message:', processingError);
        }
      },
    });
  } catch (error) {
    console.error('Error in Kafka consumer:', error);
    // Optionally exit or implement further retry logic here
    process.exit(1);
  }
};

module.exports = startConsumer;
