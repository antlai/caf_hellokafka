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

    async __ca_handlerMethod__(blob) {
        const msg = this.$.kafka.extractMessage(blob);
        if (msg) {
            await setTimeoutAsync(1000);
            this.$.log.debug(`Processing ${JSON.stringify(msg)}`);
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
