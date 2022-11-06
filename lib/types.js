
/**
 * @global
 * @typedef {Object | Array | string | number | null | boolean} jsonType
 *
 */

/**
 * @global
 * @typedef {Object} KafkaStatusType
 * @property {string} state The current state, i.e., 'START', 'READY',
 * 'RUNNING' or 'STOPPED'.
 * @property {string=} topic The current topic.
 * @property {number=} epoch The current epoch number.
 * @property {number=} offset The last confirmed offset.
 */

/**
 * @global
 * @typedef {Object} KafkaConfigType
 * @property {string=} groupId The consumer group id. It defaults to the name
 * of the admin CA.
 * @property {string} topic The selected topic.
 * @property {Array.<string>} brokers The bootstrap broker servers.
 * @property {string} clientId An identifier for the client.
 * @property {string} username The access key for the cluster.
 * @property {string} password The access password for the cluster.
 * @property {string} handlerMethodName The name of the method to process
 * messages.
 */
