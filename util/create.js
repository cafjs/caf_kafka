'use strict';

const { Kafka } = require('kafkajs');

const init = async function() {
    const username = process.env.KAFKA_USERNAME;
    const password = process.env.KAFKA_PASSWORD;

    const kafka = new Kafka({
        clientId: 'my-test-app',
        brokers: ['pkc-lgk0v.us-west1.gcp.confluent.cloud:9092'],
        ssl: true,
        sasl: {
            mechanism: 'plain',
            username,
            password
        }
    });

    const producer = kafka.producer();

    await producer.connect();
    const messages = [];

    for (let i=0; i<10; i++) {
        for (let j=0; j<100; j++) {
            messages.push({
                key: `user${i}`,
                value: `test message ${j}`
            });
        }
    }

    await producer.send({
        topic: 'test-cafjs',
        messages
    });

    await producer.disconnect();
};

init();
