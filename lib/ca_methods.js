'use strict';
const assert = require('assert');
const util = require('util');
const setTimeoutAsync = util.promisify(setTimeout);
const caf = require('caf_core');
const caf_comp = caf.caf_components;
const myUtils = caf_comp.myUtils;
const json_rpc = caf.caf_transport.json_rpc;
const app = require('../public/js/app.js');
const APP_SESSION = 'default';
const CRASH_DELAY = 100;

const isAdmin = (self) => {
    const name = json_rpc.splitName(self.__ca_getName__())[1];
    return (name === 'admin');
};

const patchState = (self) => {
    const filterSecrets = (state) => {
        if (state.config) {
            const stateClone = myUtils.deepClone(state);
            delete stateClone.config.kafkaAPISecret;
            return stateClone;
        } else {
            return state;
        }
    };

    const newState = filterSecrets(self.state);
    if (self.state.isAdmin) {
        newState.status = self.$.kafka.getStatus();
    }
    return newState;
};

exports.methods = {
    // Methods called by framework
    async __ca_init__() {
        this.$.session.limitQueue(1, APP_SESSION); // only the last notification
        this.state.fullName = this.__ca_getAppName__() + '#' +
            this.__ca_getName__();
        this.state.processed = 0;
        this.state.config = null;
        this.state.isAdmin = isAdmin(this);
        this.state.pending = {};
        this.$.crossapp.setHandleReplyMethod('__ca_handlerReply__');

        return [];
    },

    async __ca_pulse__() {
        this.state.isAdmin && this.$.react.render(app.main, [patchState(this)]);
        return [];
    },

    //External methods

    async hello(key) {
        key && this.$.react.setCacheKey(key);
        return this.getState();
    },

    async __ca_handlerReply__(id, response) {
        const [err, data] = response;
        // Ignore `duplicated offset` errors to make it idempotent
        if (err && !err.isInvalidOffset) {
            const info = this.state.pending[id] || {};
            this.$.log.warn(
                `Error processing ${JSON.stringify(info)} ` +
                    `err: ${JSON.stringify(err)} data: ${JSON.stringify(data)}`
            );
        }

        if (id) {
            delete this.state.pending[id];
        }
        return [];
    },

    async __ca_handlerMethod__(blob) {
        const msg = this.$.kafka.extractMessage(blob);
        if (msg) {
            const {key, value, offset} = msg;
            const keyStr = key.toString();
            // Parsed type is {change: number}
            const {change} = JSON.parse(value.toString());
            const offsetNum = Number(offset); // ok until 2^53
            // Retry forever to preserve ordering...
            const options = {appSuffix: 'cafjs.com', appProtocol: 'https',
                             appPort: 443};
            const id = this.$.crossapp.call(
                this.$.props.targetFQN, json_rpc.DEFAULT_FROM,
                this.$.props.targetMethod, [keyStr, offsetNum, change],
                null, null, options
            );

            this.state.pending[id] = {keyStr, offsetNum, change};

            this.$.log.debug(`Processing ${keyStr} ${offsetNum} ${change}`);
            this.state.processed = this.state.processed + 1;
            return [];
        } else {
            return [];
        }
    },

    async config(props) {
        assert(this.state.isAdmin);

        if (this.state.config === null) {
            const nonce = myUtils.randomString(10);
            this.$.kafka.configure({
                groupId: `${this.__ca_getName__()}-groupId-${nonce}`,
                clientId: `${this.__ca_getName__()}-clientId`,
                topic: props.kafkaTopic,
                brokers: props.kafkaBrokers,
                username: props.kafkaAPIKey,
                password: props.kafkaAPISecret,
                handlerMethodName: '__ca_handlerMethod__'
            });
            this.state.config = props;
            return this.getState();
        } else {
            return [new Error('Already configured, clear config first')];
        }
    },

    async clearConfig() {
        assert(this.state.isAdmin);
        this.$.kafka.clearConfiguration();
        this.state.config = null;
        return this.getState();
    },

    async start() {
        assert(this.state.isAdmin);
        this.$.kafka.run();
        return this.getState();
    },

    async reset() {
        assert(this.state.isAdmin);
        this.$.kafka.reset();
        return this.getState();
    },

    async killProcess() {
        assert(this.state.isAdmin);
        setTimeout(() => {
            process.exit(1);
        }, CRASH_DELAY);
        return this.getState();
    },

    async getState() {
        this.state.isAdmin && this.$.react.coin();
        return [null, patchState(this)];
    }
};

caf.init(module);
