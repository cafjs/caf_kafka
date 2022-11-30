"use strict"

const hello = require('./hello/main.js');
const app = hello;

const caf_core= require('caf_core');
const caf_comp = caf_core.caf_components;
const myUtils = caf_comp.myUtils;
const async = caf_comp.async;
const cli = caf_core.caf_cli;

const crypto = require('crypto');

const APP_FULL_NAME = 'root-kafka';

const CA_OWNER_1='me'+ crypto.randomBytes(8).toString('hex');
const CA_LOCAL_NAME_1='admin';
const FROM_1 =  CA_OWNER_1 + '-' + CA_LOCAL_NAME_1;
const FQN_1 = APP_FULL_NAME + '#' + FROM_1;

const util = require('util');
const setTimeoutAsync = util.promisify(setTimeout);

process.on('uncaughtException', function (err) {
               console.log("Uncaught Exception: " + err);
               console.log(myUtils.errToPrettyStr(err));
               process.exit(1);

});

const getNumProcessed = function(from) {
    const s1 = new cli.Session('ws://root-kafka.localtest.me:3000',
                               from, {from});

    return new Promise((resolve, reject) => {
        s1.onopen = async function() {
            try {
                const res = await s1.getState().getPromise();
                console.log(res);
                resolve(res.processed);
                s1.close();
            } catch (err) {
                reject(err);
            }
        };
    });
};

module.exports = {
    setUp(cb) {
       var self = this;
        app.init( {name: 'top'}, 'framework.json', null,
                      function(err, $) {
                          if (err) {
                              console.log('setUP Error' + err);
                              console.log('setUP Error $' + $);
                              // ignore errors here, check in method
                              cb(null);
                          } else {
                              self.$ = $;
                              cb(err, $);
                          }
                      });
    },
    tearDown(cb) {
        var self = this;
        if (!this.$) {
            cb(null);
        } else {
            this.$.top.__ca_graceful_shutdown__(null, cb);
        }
    },

    async hello(test) {
        test.expect(12);
        const self = this;
        let s1;
        const from1 = FROM_1;
        try {
            s1 = new cli.Session('ws://root-kafka.localtest.me:3000',
                                 from1, {
                                     from : from1
                                 });

            let p = await new Promise((resolve, reject) => {
                s1.onopen = async function() {
                    try {
                        const res = await s1.getState().getPromise();
                        test.ok(res.processed === 0);
                        resolve(res);
                    } catch (err) {
                        test.ok(false, 'Got exception ' + err);
                        reject(err);
                    }
                };
                return [];
            });

            p = await s1.start().getPromise();

            await setTimeoutAsync(10000);

            for (let i=0; i<10; i++) {
                const n = await getNumProcessed(`${CA_OWNER_1}-user${i}`);
                test.ok(n === 100, 'Wrong number of processed events');
            }
            p = await s1.start().reset();

            p = await new Promise((resolve, reject) => {
                s1.onclose = function(err) {
                    test.ifError(err);
                    resolve(null);
                };
                s1.close();
            });
            test.done();
        } catch (err) {
            test.ifError(err);
            test.done();
        }
    }

};
