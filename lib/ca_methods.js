'use strict';

const caf = require('caf_core');
const json_rpc = caf.caf_transport.json_rpc;
const app = require('../public/js/app.js');
const APP_SESSION = 'default';
const CRASH_DELAY = 100;

const isAdmin = (self) => {
    const name = json_rpc.splitName(self.__ca_getName__())[1];
    return (name === 'admin');
};

exports.methods = {
    // Methods called by framework
    async __ca_init__() {
        this.$.session.limitQueue(1, APP_SESSION); // only the last notification
        this.state.fullName = this.__ca_getAppName__() + '#' +
            this.__ca_getName__();
        this.state.processed = 0;

        if (isAdmin(this)) {
            this.$.kafka.configure({
                groupId: `${this.__ca_getName__()}-groupId`,
                clientId: `${this.__ca_getName__()}-clientId`,
                topic: this.$.props.kafkaTopic,
                brokers: this.$.props.kafkaBrokers,
                username: this.$.props.kafkaAPIKey,
                password: this.$.props.kafkaAPISecret,
                handlerMethodName: '__ca_handlerMethod__'
            });
        }

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

    async start() {
        this.$.kafka.run();
        return this.getState();
    },

    async reset() {
        this.$.kafka.reset();
        return this.getState();
    },

    async killProcess() {
        setTimeout(() => {
            process.exit(1);
        }, CRASH_DELAY);
        return this.getState();
    },

    async getState() {
        this.$.react.coin();
        return [null, this.state];
    }
};

caf.init(module);
