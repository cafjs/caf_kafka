'use strict';


const {START, READY, RUNNING, STOPPED} = require('./constants');
const ADMIN = 'admin';

/**
 * Mediates access to Kafka for this CA.
 *
 *  The admin CA controls the stream as follows:
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
 *
 * When we reload this CA from Redis, we change the underlying Kafka stream to
 * match the desired state.
 *
 * CAs different from the admin CA are passive, i.e., never do changes to the
 * stream configuration, they just receive event processing requests with the
 * configured `handlerMethodName`. Using the 'epoch' number and the 'offset'
 * they can filter duplicates or reset. See the method `extractMessage()`.
 *
 *
 * @module caf_kafka/plug_ca_kafka
 * @augments external:caf_components/gen_plug_ca
 */
// @ts-ignore: augments not attached to a class
const caf_comp = require('caf_components');
const myUtils = caf_comp.myUtils;
const json_rpc = require('caf_transport').json_rpc;
const genPlugCA = caf_comp.gen_plug_ca;

exports.newInstance = async function($, spec) {
    try {
        const caName = $.ca.__ca_getName__();
        const caLocalName = json_rpc.splitName(caName)[1];
        const isAdmin = (caLocalName === ADMIN);

        const checkAdmin = () => {
            if (!isAdmin) {
                throw new Error("Privileged operation, use the 'admin' CA");
            }
        };

        const checkNotAdmin = () => {
            if (isAdmin) {
                throw new Error("The 'admin' CA cannot process events");
            }
        };

        const checkValidState = (states, currentState) => {
            if (!states.includes(currentState)) {
                throw new Error(`Invalid state ${currentState}`);
            }
        };

        const that = genPlugCA.create($, spec);

        /*
         * The contents of this variable are always checkpointed before
         * any state externalization (see `gen_transactional`).
         *
         * desiredState: string, config:KafkaConfigType, epoch: number,
         * offset: string
         */
        that.state = {desiredState: START, epoch: 0, offset: '-1'};

        // transactional ops
        const target = {
            async syncState() {
                await $._.$.kafka.syncState(caName, that.state);
                return [];
            }
        };

        that.__ca_setLogActionsTarget__(target);

        that.configure = function(config) {
            checkAdmin();
            checkValidState([START], that.state.desiredState);

            that.state.desiredState = READY;
            that.state.config = config;
            that.__ca_lazyApply__('syncState', []);
        };

        that.run = function() {
            checkAdmin();
            if (that.state.desiredState !== RUNNING) {
                checkValidState([READY], that.state.desiredState);
                that.state.desiredState = RUNNING;
                that.__ca_lazyApply__('syncState', []);
            }
        };

        that.pause = function() {
            checkAdmin();
            if (that.state.desiredState !== STOPPED) {
                checkValidState([RUNNING], that.state.desiredState);
                that.state.desiredState = STOPPED;
                that.__ca_lazyApply__('syncState', []);
            }
        };

        that.resume = function() {
            checkAdmin();
            if (that.state.desiredState !== RUNNING) {
                checkValidState([STOPPED], that.state.desiredState);
                that.state.desiredState = RUNNING;
                that.__ca_lazyApply__('syncState', []);
            }
        };

        that.reset = function() {
            checkAdmin();
            if (that.state.desiredState !== READY) {
                checkValidState([RUNNING, STOPPED], that.state.desiredState);
                that.state.desiredState = READY;
                that.state.epoch = that.state.epoch + 1;
                that.__ca_lazyApply__('syncState', []);
            }
        };

        that.clearConfiguration = function() {
            checkAdmin();
            if (that.state.desiredState !== START) {
                checkValidState([READY, RUNNING, STOPPED],
                                that.state.desiredState);
                that.state.desiredState = START;
                that.__ca_lazyApply__('syncState', []);
            }
        };

        that.getStatus = function() {
            checkAdmin();
            return {
                state: that.state.desiredState,
                topic: that.state.config && that.state.config.topic || null,
                epoch: that.state.epoch
            };
        };

        that.extractMessage = function(blob) {
            checkNotAdmin();
            if (blob.epoch === that.state.epoch) {
                if (BigInt(blob.message.offset) > BigInt(that.state.offset)) {
                    that.state.offset = blob.message.offset;
                    return blob.message;
                } else {
                    return null;
                }
            } else if (blob.epoch < that.state.epoch) {
                return null;
            } else {
                // stream reseted
                that.state.epoch = blob.epoch;
                that.state.offset = blob.message.offset;
                return blob.message;
            }
        };

        // Framework methods
        const super__ca_resume__ =
                  myUtils.superiorPromisify(that, '__ca_resume__');
        that.__ca_resume__ = async function(cp) {
            try {
                await super__ca_resume__(cp);
                if (isAdmin) {
                    const newState = myUtils.deepClone(that.state);
                    await $._.$.kafka.syncState(caName, newState);
                }
                return [];
            } catch (err) {
                return [err];
            }
        };

        return [null, that];
    } catch (err) {
        return [err];
    }
};
