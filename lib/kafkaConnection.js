'use strict';

/*
 *
 *      ------6-------               ------4-------
 *      v            |               v            |
 *    START  --1--> READY --2--> RUNNING --3--> STOPPED
 *                    ^              |               |
 *                    |              5               5
 *                    |--------------|---------------|
 *
 *
 *     and the numbers mean:
 *   1. configure() (set stream configuration, start connection)
 *   2. run()     (start with some given offset or the beginning)
 *   3. pause()   (pause current stream)
 *   4. resume()  (continue after the pause)
 *   5. reset()   (rewind current stream to beginning)
 *   6. clearConfiguration()  (remove stream configuration)
 */
const {START, READY, RUNNING, STOPPED} = require('./constants');


exports.newConnection = function(id) {
    let state = START;
    let currentEpoch = 0;

    const that = {

        async configure({config}) {

        },

        async clearConfiguration(caState) {


        },

        async run(caState) {


        },


        async reset(caState) {


        },

        async pause(caState) {


        },

        async resume(caState) {


        },

        async syncState(caState) {
            const {desiredState, epoch} = caState;
            currentEpoch = epoch;
            if (state !== desiredState) {
                switch (state) {
                case START:
                    await that.configure(caState);
                    state = READY;
                    await that.syncState(caState);
                    break;
                case READY:

                    switch (desiredState) {
                    case START:
                        await that.clearConfiguration(caState);
                        state = START;
                        break;
                    case RUNNING:
                    case STOPPED:
                        await that.run(caState);
                        state = RUNNING;
                        await that.syncState(caState);
                        break;
                    }

                    break;
                case RUNNING:

                    switch (desiredState) {
                    case READY:
                    case START:
                        await that.reset(caState);
                        state = READY;
                        await that.syncState(caState);
                        break;
                    case STOPPED:
                        await that.pause(caState);
                        state = STOPPED;
                        break;
                    }

                    break;
                case STOPPED:

                    switch (desiredState) {
                    case RUNNING:
                        await that.resume(caState);
                        state = RUNNING;
                        break;
                    case READY:
                    case START:
                        await that.reset(caState);
                        state = READY;
                        await that.syncState(caState);
                        break;
                    }

                    break;
                }
            }
            return {id, state, epoch: currentEpoch};
        }
    };

    return that;
};
