'use strict';
const assert = require('assert');
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

const filterSecrets = (state) => {
    if (state.config) {
        const stateClone = myUtils.deepClone(state);
        delete stateClone.config.kafkaAPISecret;
        return stateClone;
    } else {
        return state;
    }
};

exports.methods = {
    // Methods called by framework
    async __ca_init__() {
        this.$.session.limitQueue(1, APP_SESSION); // only the last notification
        this.state.fullName = this.__ca_getAppName__() + '#' +
            this.__ca_getName__();
        this.state.processed = 0;
        this.state.config = null;

        return [];
    },

    async __ca_pulse__() {
        this.$.react.render(app.main, [this.state]);
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
            this.$.log.debug(`Processing ${JSON.stringify(msg)}`);
            this.state.processed = this.state.processed + 1;
            return [];
        } else {
            return [];
        }
    },

    async config(props) {
        assert(isAdmin(this));

        if (this.state.config === null) {
            this.$.kafka.configure({
                groupId: `${this.__ca_getName__()}-groupId`,
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
        assert(isAdmin(this));
        this.$.kafka.clearConfiguration();
        this.state.config = null;
        return this.getState();
    },

    async start() {
        assert(isAdmin(this));
        this.$.kafka.run();
        return this.getState();
    },

    async reset() {
        assert(isAdmin(this));
        this.$.kafka.reset();
        return this.getState();
    },

    async killProcess() {
        assert(isAdmin(this));
        setTimeout(() => {
            process.exit(1);
        }, CRASH_DELAY);
        return this.getState();
    },

    async getState() {
        this.$.react.coin();
        return [null, filterSecrets(this.state)];
    }
};

caf.init(module);
