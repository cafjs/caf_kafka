'use strict';
/**
 * Connects to Kafka to create gateways that process events.
 *
 *  Properties:
 *
 *       {kafkaBootstrapServers: string, kafkaAPIKey: string,
*         kafkaAPISecret: string }
 *
 * where:
 * * `kafkaBootstrapServers`: kafka server address and port, e.g.,
 *  localhost:9093.
 * * `kafkaAPIKey`: kafka service API key from, e.g.,  the Confluent Cloud.
 * * `kafkaAPISecret`: kafka service API secret from, e.g., the Confluent Cloud.
 *
 *
 * @module caf_kafka/plug_kafka
 * @augments external:caf_components/gen_plug
 */
// @ts-ignore: augments not attached to a class
const assert = require('assert');
const caf_comp = require('caf_components');
const genPlug = caf_comp.gen_plug;

exports.newInstance = async function($, spec) {
    try {
        const that = genPlug.create($, spec);

        $._.$.log && $._.$.log.debug('New Kafka plug');

        assert.equal(typeof spec.env.kafkaBootstrapServers, 'string',
                     "'spec.env.kafkaBootstrapServers' is not a string");

        assert.equal(typeof spec.env.kafkaAPIKey, 'string',
                     "'spec.env.kafkaAPIKey' is not a string");

        assert.equal(typeof spec.env.kafkaAPISecret, 'string',
                     "'spec.env.kafkaAPISecret' is not a string");


        return [null, that];
    } catch (err) {
        return [err];
    }
};
