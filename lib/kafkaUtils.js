'use strict';
const util = require('util');
const json_rpc = require('caf_transport').json_rpc;

const findTargetName = function(caName, key) {
    const name = json_rpc.splitName(caName);
    name[1] = (key === 'admin' ? 'admin732342': key);
    return json_rpc.joinNameArray(name);
};

const findTarget = function($, targetName) {
    let target = $._.$.registry.$[targetName];
    if (target) {
        return target;
    } else {
        const spec = {
            name: targetName,
            env: {
                blockCreate: false //security issue, no limits on #CAs created
            }
        };
        // Assumes single process, does not try to redirect or retry...
        const instAsync = util.promisify($._.$.registry.__ca_instanceChild__);
        return instAsync(null, spec);
    }
};

/*
 * WARNING: this function bypasses security & quota mechanisms.
 *
 */
exports.processMessages = ($, caName, caState, messages) => {
    $._.$.log && $._.$.log.debug(`Processing ${messages.length} messages`);

    return messages.map(async (message) => {
        const targetName = findTargetName(caName, message.key);
        const target = await findTarget($, targetName);
        if (target) {
            const m = json_rpc.systemRequest(
                targetName, caState.config.handlerMethodName, {
                    epoch: caState.epoch,
                    message
                }
            );
            const asyncProcess = util.promisify(target.__ca_process__);
            return asyncProcess(m);
        } else {
            throw new Error(`Missing target CA for ${message.key}`);
        }
    });
};
