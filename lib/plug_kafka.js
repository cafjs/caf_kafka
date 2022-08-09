'use strict';
/**
 * Connects to Kafka to create gateways that process events.
 *
 *  Properties:
 *
 *       {}
 *
 * where:
 *
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

        return [null, that];
    } catch (err) {
        return [err];
    }
};
