'use strict';

const hdkey = require('../hdkey');
const ltc = require('../controllers/ltc');
const assert = require('assert');

function createValidData() {
    var inputs = [
        {
            address: 'LQae67Jr1yYcbqjMC2G9dJhLu7evY5DsQU',
            addressIndex: 2,
            txId: 'f7645947c9ff69f142ab430cc429ce70a87d64339f690b18349d9126554b9d33',
            outputIndex: 0,
            scriptPubKey: '76a9143ac2316c6acb3a14bb3cbf08f48a5fea0a3f4a1888ac',
            amount: 0.02
        }
    ];

    var outputs = [
        {
            address: 'LdvT83ksiBnDuGm8nY7erzBuwz9Q3LXGMi',
            amount: 0.016
        }
    ];

    var change = {
        address: 'LUUjVwXE74vxxUVWMGRS3uNvRYs9twZ5vX',
        addressIndex: 0,
        amount: 0.0038
    };

    return {
        inputs,
        outputs,
        change
    }
}

describe('#ltc', function() {
    it('#address', () => {
        process._password = 'hdpassword';
        const p = ltc.getLTCECPair(2);
        assert.equal(p.getAddress(), 'LQae67Jr1yYcbqjMC2G9dJhLu7evY5DsQU');
    })
    it('#transaction', () => {
        const data = createValidData();
        const tx = ltc.createTransaction(data);
        assert.equal(tx, '0100000001339d4b5526919d34180b699f33647da870ce29c40c43ab42f169ffc9475964f7000000006b483045022100ef84281316219a33db9fcb6563c934063bdbf29b98b895728ccd2fe4b17b368a02204a36e8e87b9375ea02a7d0bdf92069efc146e95a82be271cf884bafdd9635d78012103651ad2a2630192a11779f6d7a5fec2dcf61cda8e123b964b7a13d658f4fec978ffffffff02006a1800000000001976a914cd1afe389e2ba3b72628b0d7c7316277bd3c7ef488ac60cc0500000000001976a9146584b79aa3b6522b0276770401b3d14c1475ae5c88ac00000000');
    })
});