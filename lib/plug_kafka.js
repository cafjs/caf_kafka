'use strict';
/**
 * Connects to Kafka to create gateways that process events.
 *
 *
 *
 * @module caf_kafka/plug_kafka
 * @augments external:caf_components/gen_plug
 */
// @ts-ignore: augments not attached to a class
const caf_comp = require('caf_components');
const genPlug = caf_comp.gen_plug;
const kafkaConnection = require('./kafkaConnection');

exports.newInstance = async function($, spec) {
    try {
        const connections = {};

        const that = genPlug.create($, spec);

        $._.$.log && $._.$.log.debug('New Kafka plug');

        that.syncState = async function(id, caState) {
            let con = connections[id];
            if (!con) {
                con = kafkaConnection.newConnection(id);
                connections[id] = con;
            }
            return con.syncState(caState);
        };

        return [null, that];
    } catch (err) {
        return [err];
    }
};
