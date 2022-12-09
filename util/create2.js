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

    for (let i=0; i<100; i++) {
        for (let j=0; j<100; j++) {
            const sourceIndex = Math.floor(Math.random()*100);
            const source = `user${sourceIndex}`;
            const destIndex = Math.floor(Math.random()*100);
            const target = `user${destIndex}`;
            messages.push({
                key: source,
                value: JSON.stringify({change: -1})
            });
            messages.push({
                key: target,
                value: JSON.stringify({change: 1})
            });
        }
    }

    await producer.send({
        topic: 'hellokafka-10k',
        messages
    });

    await producer.disconnect();
};

init();
