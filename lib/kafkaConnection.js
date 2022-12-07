'use strict';

const { Kafka } = require('kafkajs');

const kafkaUtils = require('./kafkaUtils');
/*
 *
 *      ------6-------               ------4-------
 *      v            |               v            |
 *    START  --1--> READY --2--> RUNNING --3--> STOPPED
 *                    ^              |               |
 *                    |              5               5
 *                    |--------------|---------------|
 *
 *
 *     and the numbers mean:
 *   1. configure() (set stream configuration, start connection)
 *   2. run()     (start with some given offset or the beginning)
 *   3. pause()   (pause current stream)
 *   4. resume()  (continue after the pause)
 *   5. reset()   (rewind current stream to beginning)
 *   6. clearConfiguration()  (remove stream configuration)
 */
const {START, READY, RUNNING, STOPPED} = require('./constants');

const COMMIT_INTERVAL_MSEC = 5000;

exports.newConnection = function($, id, minibatchSize) {
    let state = START;
    let currentEpoch = 0;
    let props = null;
    let kafka = null;
    let consumer = null;
    const that = {

        async configure({config}) {
            props = config;
            kafka = new Kafka({
                clientId: props.clientId,
                brokers: props.brokers,
                ssl: true,
                sasl: {
                    mechanism: 'plain',
                    username: props.username,
                    password: props.password
                }
            });
        },

        async clearConfiguration() {
            props = null;
            kafka = null;
        },

        async run(caState) {
            consumer = kafka.consumer({
                groupId: props.groupId + '-' + caState.epoch
            });
            await consumer.connect();
            await consumer.subscribe({
                topic: props.topic,
                fromBeginning: true
            });

            await consumer.run({
                autoCommit: false,
                autoCommitInterval: COMMIT_INTERVAL_MSEC,
                eachBatchAutoResolve: false,
                eachBatch: async ({
                    batch,
                    resolveOffset,
                    heartbeat,
                    commitOffsetsIfNecessary,
                    isRunning,
                    isStale
                }) => {
                    const n = Math.floor(batch.messages.length/minibatchSize);
                    for (let i=0; i<n; i++) {
                        if (isRunning() && !isStale()) {
                            const messages = batch.messages.slice(
                                i*minibatchSize, (i+1)*minibatchSize
                            );
                            await Promise.all(
                                kafkaUtils.processMessages(
                                    $, id, caState, messages
                                )
                            );
                            $._.$.log && $._.$.log.debug(
                                `Ending Minibatch ${i}`);
                            await heartbeat();
                        }
                    }

                    const leftOver = batch.messages.length % minibatchSize;
                    if (leftOver > 0) {
                        const messages = batch.messages.slice(n*minibatchSize);
                        if (isRunning() && !isStale()) {
                            await Promise.all(
                                kafkaUtils.processMessages(
                                    $, id, caState, messages
                                )
                            );
                            $._.$.log && $._.$.log.debug(
                                'Ending Last Minibatch');
                            await heartbeat();
                        }
                    }

                    if (isRunning() && !isStale()) {
                        $._.$.log && $._.$.log.debug('Ending Batch');
                        resolveOffset(batch.lastOffset());
                        await commitOffsetsIfNecessary();
                    }
                }
            });
        },

        async reset() {
            await consumer.disconnect();
            consumer = null;
        },

        async pause() {
            consumer.pause([{topic: props.topic}]);
        },

        async resume() {
            consumer.resume([{topic: props.topic}]);
        },

        async syncState(caState) {
            const {desiredState, epoch} = caState;
            currentEpoch = epoch;
            $._.$.log && $._.$.log.debug(
                `syncState: from ${state} to ${desiredState}`
            );
            if (state !== desiredState) {
                switch (state) {
                case START:
                    await that.configure(caState);
                    state = READY;
                    await that.syncState(caState);
                    break;
                case READY:

                    switch (desiredState) {
                    case START:
                        await that.clearConfiguration();
                        state = START;
                        break;
                    case RUNNING:
                    case STOPPED:
                        await that.run(caState);
                        state = RUNNING;
                        await that.syncState(caState);
                        break;
                    }

                    break;
                case RUNNING:

                    switch (desiredState) {
                    case READY:
                    case START:
                        await that.reset();
                        state = READY;
                        await that.syncState(caState);
                        break;
                    case STOPPED:
                        await that.pause();
                        state = STOPPED;
                        break;
                    }

                    break;
                case STOPPED:

                    switch (desiredState) {
                    case RUNNING:
                        await that.resume();
                        state = RUNNING;
                        break;
                    case READY:
                    case START:
                        await that.reset();
                        state = READY;
                        await that.syncState(caState);
                        break;
                    }

                    break;
                }
            }
            return {id, state, epoch: currentEpoch};
        }
    };

    return that;
};
