'use strict';

/**
 * Validate JSON using schema.
 * 
 * @author: Michael Liao
 */

const
    _ = require('lodash'),
    jjv = require('jjv');

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

module.exports = {

    PROPERTY: PROPERTY,

    createSchema: (data) => {
        let env = jjv();
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
        for (let name in data) {
            env.addSchema(name, data[name]);
        }
        return env;
    }
};
