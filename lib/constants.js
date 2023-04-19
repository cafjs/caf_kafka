'use strict';
/**@type {string} */
const START = exports.START = 'START';
/**@type {string} */
const READY = exports.READY = 'READY';
/**@type {string} */
const RUNNING = exports.RUNNING = 'RUNNING';
/**@type {string} */
const STOPPED = exports.STOPPED = 'STOPPED';

exports.FSM = {
    'START': START,
    'READY': READY,
    'RUNNING': RUNNING,
    'STOPPED': STOPPED
};
