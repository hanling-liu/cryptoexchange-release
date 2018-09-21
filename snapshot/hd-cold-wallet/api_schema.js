'use strict';

/**
 * Validate JSON using schema.
 * 
 * @author: Michael Liao
 */

const
    _ = require('lodash'),
    jjv = require('jjv'),
    env = jjv();

env.defaultOptions.useDefault = true;
env.defaultOptions.removeAdditional = true;

env.addCheck('nonEmpty', (v, flag) => {
    if (flag) {
        if (v) {
            return v.trim() !== '';
        }
        return false;
    }
    return true;
});

const PROPERTY = {};

// common patterns ////////////////////////////////////////////////////////////

// 64-char hex value:
PROPERTY.HASH256 = {
    type: 'string',
    pattern: '^[0-9a-f]{64}$'
};

// index: 0 ~ 65535
PROPERTY.INDEX = {
    type: 'integer',
    minimum: 0,
    maximum: 65535
};

// bip index starts from 0:
PROPERTY.HD_INDEX = {
    type: 'integer',
    minimum: 0,
    maximum: 65535
};

// amount as float:
PROPERTY.AMOUNT = {
    type: 'number',
    minimum: 0
};

// hex value:
PROPERTY.HEX = {
    type: 'string',
    pattern: '^[a-f0-9]{0,2048}$' 
};

// USDT patterns ///////////////////////////////////////////////////////////////

PROPERTY.USDT_ADDRESS = {
    type: 'string',
    pattern: '^[13mn][0-9a-zA-Z]{30,36}$'
};

PROPERTY.USDT_INPUT = {
    type: 'object',
    properties: {
        addressIndex: PROPERTY.HD_INDEX,
        address: PROPERTY.USDT_ADDRESS,
        txId: PROPERTY.HASH256,
        outputIndex: PROPERTY.INDEX,
        scriptPubKey: PROPERTY.HEX,
        amount: PROPERTY.AMOUNT
    },
    required: ['addressIndex', 'address', 'txId', 'outputIndex', 'scriptPubKey', 'amount']
};

PROPERTY.USDT_OUTPUT = {
    type: 'object',
    properties: {
        address: PROPERTY.USDT_ADDRESS,
        amount: PROPERTY.AMOUNT
    },
    required: ['address', 'amount']
};

PROPERTY.USDT_CHANGE = {
    type: 'object',
    properties: {
        addressIndex: PROPERTY.HD_INDEX,
        address: PROPERTY.USDT_ADDRESS,
        amount: PROPERTY.AMOUNT
    },
    required: ['addressIndex', 'address', 'amount']
};


// QTUM patterns //////////////////////////////////////////////////////////////

// qtum address:
PROPERTY.QTUM_ADDRESS = {
    type: 'string',
    pattern: '^Q[0-9a-zA-Z]{30,36}$'
};

// qtum input:
PROPERTY.QTUM_INPUT = {
    type: 'object',
    properties: {
        addressIndex: PROPERTY.HD_INDEX,
        address: PROPERTY.QTUM_ADDRESS,
        txId: PROPERTY.HASH256,
        outputIndex: PROPERTY.INDEX,
        scriptPubKey: PROPERTY.HEX,
        amount: PROPERTY.AMOUNT
    },
    required: ['addressIndex', 'address', 'txId', 'outputIndex', 'scriptPubKey', 'amount']
};

// qtum output:
PROPERTY.QTUM_OUTPUT = {
    type: 'object',
    properties: {
        address: PROPERTY.QTUM_ADDRESS,
        amount: PROPERTY.AMOUNT
    },
    required: ['address', 'amount']
};

// qtum change:
PROPERTY.QTUM_CHANGE = {
    type: 'object',
    properties: {
        addressIndex: PROPERTY.HD_INDEX,
        address: PROPERTY.QTUM_ADDRESS,
        amount: PROPERTY.AMOUNT
    },
    required: ['addressIndex', 'address', 'amount']
};

// qtum contract:
PROPERTY.QTUM_CONTRACT = {
    type: 'object',
    properties: {
        address: PROPERTY.QTUM_ADDRESS,
        decimals: {
            type: 'integer',
            minimum: 0,
            maximum: 24
        }
    },
    required: ['address', 'decimals']
};

// BUILD FINAL SCHEMA /////////////////////////////////////////////////////////

const USDT = {
    type: 'object',
    properties: {
        inputs: {
            type: 'array',
            items: PROPERTY.USDT_INPUT,
            minItems: 1
        },
        outputs: {
            type: 'array',
            items: PROPERTY.USDT_OUTPUT,
            minItems: 1
        },
        change: PROPERTY.USDT_CHANGE
    },
    required: ['inputs', 'outputs']
};

const QTUM = {
    type: 'object',
    properties: {
        inputs: {
            type: 'array',
            items: PROPERTY.QTUM_INPUT,
            minItems: 1
        },
        outputs: {
            type: 'array',
            items: PROPERTY.QTUM_OUTPUT,
            minItems: 1
        },
        change: PROPERTY.QTUM_CHANGE
    },
    required: ['inputs', 'outputs']
};

const QRC20 = {
    type: 'object',
    properties: {
        contract: PROPERTY.QTUM_CONTRACT,
        input: PROPERTY.QTUM_INPUT,
        output: PROPERTY.QTUM_OUTPUT
    },
    required: ['contract', 'input', 'output']
};

env.addSchema('USDT', USDT);
env.addSchema('QTUM', QTUM);
env.addSchema('QRC20', QRC20);

module.exports = {
    validate: (schemaName, data) => {
        let errors = env.validate(schemaName, data);
        if (errors !== null) {
            console.warn(`api:check schema failed: ${JSON.stringify(errors)}`);
            throw new Error('invalid api request.');
        }
    }
};
