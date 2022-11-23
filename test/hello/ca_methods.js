"use strict";
const caf = require('caf_core');
const json_rpc = caf.caf_transport.json_rpc;

const isAdmin = (self) => {
    const name = json_rpc.splitName(self.__ca_getName__())[1];
    return (name === 'admin');
};

exports.methods = {
    async __ca_init__() {
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
        this.$.log.debug("++++++++++++++++Calling init");
        return [];
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

    async __ca_pulse__() {
        this.$.log.debug('<<< Calling Pulse>>>');
        return [];
    },

    async start() {
        this.$.kafka.run();
        return [];
    },

    async reset() {
        this.$.kafka.reset();
        return [];
    },

    async getState() {
        return [null, this.state];
    }
};
