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

        Object.freeze(that);

        return [null, that];
    } catch (err) {
        return [err];
    }
};
