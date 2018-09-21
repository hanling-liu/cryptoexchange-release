'use strict';

/**
 * Test btc.js.
 */

const
    bitcoin = require('bitcoinjs-lib'),
    ECPair = bitcoin.ECPair,
    btc = require('../controllers/btc'),
    expect = require('chai').expect;

process._password = 'NB123456789012345678901234567890';

function createValidData() {
    // test data:

    // inputs: index, private key, address:
    // 0, L3Hyzdq69gMMiShz9Ct3vXGCz5djQsw6b5qMpChf28ZsioidzBxm, 1KFgfut3qVVTzopdaJupKgk72oypFCQ8mK
    // 1, L5hXG9juPSuzhQgeBspjgJgySVqZdcZ71LZNREQgdJ3Y7c9ijFq2, 1Jsw3vA2SaNgSwSKCWuEze4AJRWC2yBdKQ
    // 2, KynRGxFZW85ybzKUKZ4pzKEnzFtXVqrLtiAo1ZGGkj2rA89RXvHN, 14JktmCUv1UDGbs4jqeGfi9vqyHvieP2Ya

    // outputs: address, amount:
    // 1651vrYJbM6ZJtkjx2T3eM6Cj7nXTQHn8K
    // 18dcVwusreC7FqkFVd6NzjU1f6PSJZJyct

    // change: index, address:
    // 0, 1KFgfut3qVVTzopdaJupKgk72oypFCQ8mK

    var inputs = [
        {
            address: '14JktmCUv1UDGbs4jqeGfi9vqyHvieP2Ya',
            addressIndex: 2,
            txId: 'bf7ed2b603324119261415bd0af3862c2e5629d660e93212e57e0492617b92f8',
            outputIndex: 1,
            scriptPubKey: '76a914244416990d8246d89e9ad640dd327158098aab2e88ac',
            amount: 0.0107
        },
        {
            address: '1PvXzdmL7RcaamqPisQ592u4NhohEmtkxX',
            addressIndex: 3,
            txId: 'bf7ed2b603324119261415bd0af3862c2e5629d660e93212e57e0492617b92f8',
            outputIndex: 2,
            scriptPubKey: '76a914fb72af7956c98c842d9851d5973e7dc8bb6b9f0488ac',
            amount: 0.0123
        }
    ];

    var outputs = [
        {
            address: '1HRSzQoxwV8YMyt842RoFECshyQNYgYXFA',
            amount: 0.004
        },
        {
            address: '1651vrYJbM6ZJtkjx2T3eM6Cj7nXTQHn8K',
            amount: 0.005
        },
        {
            address: '1MLcpvL3jFzupJzcmANYueMdoaracD5n4b',
            amount: 0.006
        }
    ];

    var change = {
        address: '1KFgfut3qVVTzopdaJupKgk72oypFCQ8mK',
        addressIndex: 0,
        amount: 0.00799
    };

    return {
        inputs: inputs,
        outputs: outputs,
        change: change
    }
}

describe('#btc', () => {

    it('create-btc-tx', () => {
        let data = createValidData();
        let tx = btc.createTransaction(data);
        expect(tx).to.be.a('string').and.equals('0100000002f8927b6192047ee51232e960d629562e2c86f30abd15142619413203b6d27ebf010000006a473044022043cb5bd5c77297fb2567fd83351fbc0a3b2025216b3fe219ce0ff490029c7a1d02205e81c8f6615fa2a39cee60283ec2289894715bd432c39fa6898550cdc55038f0012102bf1252874d8fd79748aa1d4c4b06b25be0fff37c6e80863e2e1fa8ba926c58c9fffffffff8927b6192047ee51232e960d629562e2c86f30abd15142619413203b6d27ebf020000006a47304402204deec37c00f5cc2da333402fd051293316288d7187e3d6bf5e7309f52ac48e1802201fa6929644258040df7a23af7bd8f92eded9fe3165d5880f0a74216cdbc91371012103a5a5cde4db8dcb61b1ec1cc1c1e98f9f477e843f494aea591832e387d6221f36ffffffff04801a0600000000001976a914b421b0db4d0ef4a761bf7e8227062a3446e02ca088ac20a10700000000001976a914379b115ef3fca5a6460639b99e032d39bca2f0ae88acc0270900000000001976a914df18533d3cc180677e9042147ec77cbc135dc4c688ac18310c00000000001976a914c8393402ad9f6401821a99caac639633ce1467f688ac00000000');
    });

    it('create-btc-tx-with-multisig', () => {
        let data = createValidData();
        data.outputs[0].address = '3HrvTpHGGZwn3YVZjaZU6ar9uKitCSS7ko';
        let tx = btc.createTransaction(data);
        expect(tx).to.be.a('string').and.equals('0100000002f8927b6192047ee51232e960d629562e2c86f30abd15142619413203b6d27ebf010000006a47304402201f08c99f5f8942c185584ee54a188fb67d2fdc4498aa59b83052afbd0e8cc58802204fbfb76c8c8eae64278f2fd214a00d8c4fa9f20b5a3d5cb78c7661bddfe388a1012102bf1252874d8fd79748aa1d4c4b06b25be0fff37c6e80863e2e1fa8ba926c58c9fffffffff8927b6192047ee51232e960d629562e2c86f30abd15142619413203b6d27ebf020000006b48304502210088e10c5a61c9a1a534552930a21f2fa5a456f9410bf15c218f364edba828732302207b5e2f28538d442c7e9575a4dc34d9851c9a1a54861b4e8134a0e26f60562cbb012103a5a5cde4db8dcb61b1ec1cc1c1e98f9f477e843f494aea591832e387d6221f36ffffffff04801a06000000000017a914b1619d1af3de75548f28e77d5024435a35c88a0e8720a10700000000001976a914379b115ef3fca5a6460639b99e032d39bca2f0ae88acc0270900000000001976a914df18533d3cc180677e9042147ec77cbc135dc4c688ac18310c00000000001976a914c8393402ad9f6401821a99caac639633ce1467f688ac00000000');
    });

    it('create-btc-tx-without-change', () => {
        let data = createValidData();
        data.outputs[0].amount += data.change.amount;
        delete data.change
        let tx = btc.createTransaction(data);
        expect(tx).to.be.a('string').and.equals('0100000002f8927b6192047ee51232e960d629562e2c86f30abd15142619413203b6d27ebf010000006a47304402203b3a8cf79dd92312cda48ea9890c814947a40b717ccb77773cc6a338dc42350c02205848197e834d04c303e98111ef4791f9751af8f22a2a435121097b0c7dec15e1012102bf1252874d8fd79748aa1d4c4b06b25be0fff37c6e80863e2e1fa8ba926c58c9fffffffff8927b6192047ee51232e960d629562e2c86f30abd15142619413203b6d27ebf020000006b48304502210093ebe19d095fc855a45f0a12d6a6aaaa5f08238c243678681a47fac65a11a650022069b09d76147e9956bec6541663223a5d43da992721209232b16182f96dfea06f012103a5a5cde4db8dcb61b1ec1cc1c1e98f9f477e843f494aea591832e387d6221f36ffffffff03984b1200000000001976a914b421b0db4d0ef4a761bf7e8227062a3446e02ca088ac20a10700000000001976a914379b115ef3fca5a6460639b99e032d39bca2f0ae88acc0270900000000001976a914df18533d3cc180677e9042147ec77cbc135dc4c688ac00000000');
    });

    it('create-btc-tx-but-change-addressIndex-is-invalid', () => {
        let data = createValidData();
        data.change.address = '1Jsw3vA2SaNgSwSKCWuEze4AJRWC2yBdKQ';
        data.change.addressIndex = 1;
        expect(() => btc.createTransaction(data)).to.throw('addressIndex of change MUST be 0.');
    });

    it('create-btc-tx-but-input-addressIndex-is-invalid', () => {
        let data = createValidData();
        data.inputs[0].addressIndex = 5;
        expect(() => btc.createTransaction(data)).to.throw(/invalid address/);
    });

    it('create-btc-tx-but-fee-is-zero', () => {
        let data = createValidData();
        data.change.amount = 0.008;
        expect(() => btc.createTransaction(data)).to.throw(/fee is equal or less than 0/);
    });

    it('create-btc-tx-but-fee-is-too-much', () => {
        let data = createValidData();
        data.outputs[1].amount -= 0.0049;
        data.outputs[2].amount -= 0.0051;
        expect(() => btc.createTransaction(data)).to.throw(/fee is too high/);
    });

    it('curl-call-btc-tx', () => {
        let data = JSON.stringify(createValidData());
        console.log(`curl -X POST -H 'Content-type: application/json' -d '${data}' localhost:3000`);
    });
});
