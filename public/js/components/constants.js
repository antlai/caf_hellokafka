'use strict';

const START = exports.START = 'START';
const READY = exports.READY = 'READY';
const RUNNING = exports.RUNNING = 'RUNNING';
const STOPPED = exports.STOPPED = 'STOPPED';

exports.FSM = {
    'START': START,
    'READY': READY,
    'RUNNING': RUNNING,
    'STOPPED': STOPPED
};
