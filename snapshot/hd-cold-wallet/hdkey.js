'use strict';

const
    bitcoin = require('bitcoinjs-lib'),
    HDNode = bitcoin.HDNode,
    aes256 = require('./aes256');

/**
 * Get hex-encoded string as KeyPair.
 *
 * @param {string} currency
 * @param {integer} index
 * @param {network} network config of network.
 */
function getECPair(currency, index, network) {
    if (! currency in process._hdPrivateKeyshdPrivateKeys) {
        console.warn('HD cold wallet not initialized.');
        throw new Error('Currency not supported.');
    }
    let
        encrypted = process._hdPrivateKeys[currency],
        xprv = aes256.decrypt(encrypted, process._password),
        xprvRoot = network ? HDNode.fromBase58(xprv, network) : HDNode.fromBase58(xprv),
        ecPair = xprvRoot.derive(index).keyPair;
    return ecPair;
}

module.exports = {
    getECPair: getECPair
};
