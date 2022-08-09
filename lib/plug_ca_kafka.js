'use strict';

/**
 * Mediates access to Kafka for this CA.
 *
 *
 * @module caf_kafka/plug_ca_kafka
 * @augments external:caf_components/gen_plug_ca
 */
// @ts-ignore: augments not attached to a class
const caf_comp = require('caf_components');
const myUtils = caf_comp.myUtils;
const genPlugCA = caf_comp.gen_plug_ca;


exports.newInstance = async function($, spec) {
    try {
        let executableSchema = null;
        let lastResult = null;

        const that = genPlugCA.create($, spec);

        /*
         * The contents of this variable are always checkpointed before
         * any state externalization (see `gen_transactional`).
         */
        that.state = {}; //

        // transactional ops
        const target = {
        };

        that.__ca_setLogActionsTarget__(target);

        return [null, that];
    } catch (err) {
        return [err];
    }
};
