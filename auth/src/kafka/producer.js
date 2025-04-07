// kafka/producer.js
const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'auth-service',
  brokers: ['kafka:9092'], // internal docker network
});

const producer = kafka.producer();
module.exports = producer;
