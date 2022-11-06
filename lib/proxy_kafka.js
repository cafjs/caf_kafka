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
         * @param {number} epoch An epoch number to reset processing CAs when
         * needed.
         * @param {number} offset An offset in the queue to start.
         *
         * @throws Error if pipeline not in READY state.
         *
         * @memberof! module:caf_graphql/proxy_kafka#
         * @alias start
         */
        that.start = function(epoch, offset) {
            $._.start(epoch, offset);
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
         * Resets the processing of messages.
         *
         * The epoch number increments and the pipelined stopped.
         *
         * @memberof! module:caf_graphql/proxy_kafka#
         * @alias reset
         */
        that.reset = function() {
            $._.reset();
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
            $._.getStatus();
        };

        Object.freeze(that);

        return [null, that];
    } catch (err) {
        return [err];
    }
};
