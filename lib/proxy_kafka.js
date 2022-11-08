'use strict';

/**
 *  Proxy that allows a CA to interact with Kafka.
 *
 * @module caf_kafka/proxy_kafka
 * @augments external:caf_components/gen_proxy
 */
// @ts-ignore: augments not attached to a class
const caf_comp = require('caf_components');
const genProxy = caf_comp.gen_proxy;

exports.newInstance = async function($, spec) {
    try {
        const that = genProxy.create($, spec);

        /**
         * Configures the pipeline processing a Kafka stream.
         *
         * Pipelines that are currently active need to be `reset()` first.
         *
         * @param {KafkaConfigType} config A new configuration.
         *
         * @throws Error if invalid credentials or pipeline currently active.
         *
         * @memberof! module:caf_graphql/proxy_kafka#
         * @alias configure
         */
        that.configure = function(config) {
            $._.configure(config);
        };

        /**
         * Starts the processing of messages.
         *
         * @throws Error if pipeline not in READY state.
         *
         * @memberof! module:caf_graphql/proxy_kafka#
         * @alias run
         */
        that.run = function() {
            $._.run();
        };

        /**
         * Pauses the processing of messages.
         *
         * @throws Error if pipeline not in RUNNING state.
         *
         * @memberof! module:caf_graphql/proxy_kafka#
         * @alias pause
         */
        that.pause = function() {
            $._.pause();
        };

        /**
         * Resumes the processing of messages.
         *
         * @throws Error if pipeline not in STOPPED state.
         *
         * @memberof! module:caf_graphql/proxy_kafka#
         * @alias resume
         */
        that.resume = function() {
            $._.resume();
        };

        /**
         * Resets the processing of messages by rewinding the stream.
         *
         * @memberof! module:caf_graphql/proxy_kafka#
         * @alias reset
         */
        that.reset = function() {
            $._.reset();
        };

        /**
         * Removes previous configuration.
         *
         * @memberof! module:caf_graphql/proxy_kafka#
         * @alias clearConfiguration
         */
        that.clearConfiguration = function() {
            $._.clearConfiguration();
        };

        /**
         * Gets the current pipeline status.
         *
         * @return {KafkaStatusType} The current status of the pipeline.
         *
         * @memberof! module:caf_graphql/proxy_kafka#
         * @alias getStatus
         */
        that.getStatus = function() {
            return $._.getStatus();
        };

        /**
         * Extracts a received message from a blob.
         *
         * The goal is to filter messages that have already been processed:
         *
         *    const msg = this.$.kafka.extractMessage(blob);
         *    if (msg) {
         *       // process msg ...
         *    } else {
         *      // ignore already processed message...
         *      return [];
         *    }
         *
         * @param {MessageBlobType} blob A received message blob.
         *
         * @return {null|MessageType} The message encoded in the blob or `null`
         * if the message has already been processed.
         *
         * @memberof! module:caf_graphql/proxy_kafka#
         * @alias extractMessage
         */
        that.extractMessage = function(blob) {
            return $._.extractMessage(blob);
        };

        Object.freeze(that);

        return [null, that];
    } catch (err) {
        return [err];
    }
};
