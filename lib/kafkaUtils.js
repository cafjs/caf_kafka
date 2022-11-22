'use strict';
const util = require('util');
const json_rpc = require('caf_transport').json_rpc;

/*
 * WARNING: this function bypasses security & quota mechanisms.
 *
 */
exports.processMessages = ($, caName, caState, messages) =>
    messages.map(async (message) => {
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
