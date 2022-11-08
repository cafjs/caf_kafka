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

        async syncState(newState) {
            const {desiredState, epoch} = newState;
            currentEpoch = epoch;
            if (state !== desiredState) {
                switch (state) {
                case START:
                    await that.configure(newState);
                    state = READY;
                    await that.syncState(newState);
                    break;
                case READY:

                    switch (desiredState) {
                    case START:
                        await that.clearConfiguration(newState);
                        state = START;
                        break;
                    case RUNNING:
                    case STOPPED:
                        await that.run(newState);
                        state = RUNNING;
                        await that.syncState(newState);
                        break;
                    }

                    break;
                case RUNNING:

                    switch (desiredState) {
                    case READY:
                    case START:
                        await that.reset(newState);
                        state = READY;
                        await that.syncState(newState);
                        break;
                    case STOPPED:
                        await that.pause(newState);
                        state = STOPPED;
                        break;
                    }

                    break;
                case STOPPED:

                    switch (desiredState) {
                    case RUNNING:
                        await that.resume(newState);
                        state = RUNNING;
                        break;
                    case READY:
                    case START:
                        await that.reset(newState);
                        state = READY;
                        await that.syncState(newState);
                        break;
                    }

                    break;
                }
            }
            return state;
        }
    };

    return that;
};
