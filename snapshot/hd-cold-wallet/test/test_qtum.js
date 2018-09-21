'use strict';

/**
 * Test qtum.js.
 */

const
    qtum = require('../controllers/qtum'),
    expect = require('chai').expect;

process._password = 'NB123456789012345678901234567890';

function createValidData() {
    // test data:

    // inputs: index, private key, address:
    // 1, Kxc5nfkok94GP1L8gvWsiRYgAKJJn9o8i5NsYHaF4CDmrx9a5bok, QSZ7ah6jaiwKpUYF1dZaj7i4U1gwLzkEwi, 0.23400 QTUM
    // 2, L3avofV4AkdmXh2rQZCMFAQzKaRrhc8Xg65oELiD8soSVYhaGwWb, QbZuWvoJVZy16nCoCac3YQm8Keejgqj6g6, 0.12345 QTUM

    // outputs: address, amount:
    // QSzCug8gGM6CgSFHoEMzhmxQfHjFbF2JGm
    // QiZiSGsprq3sFRwPi3UxoXyQGQH5wVkK8b

    // change: index, address:
    // 0, QRWFY4jj7ABP1Rd3sjQpNpH9ADfHV4DyY4

    var inputs = [
        {
            address: 'QSZ7ah6jaiwKpUYF1dZaj7i4U1gwLzkEwi',
            addressIndex: 1,
            txId: 'c772f8746baae7b75f4e1a75ceac4681f3d4984848a64c62c28a2dfb70f99026',
            outputIndex: 0,
            scriptPubKey: '76a9144145be8f881877eafe67b7cd367986b68588493e88ac',
            amount: 0.234
        },
        {
            address: 'QbZuWvoJVZy16nCoCac3YQm8Keejgqj6g6',
            addressIndex: 2,
            txId: 'cfdf7c8b106b3b599de3950e978cd8d9e3102f4454dc17d642401c2d466559bb',
            outputIndex: 0,
            scriptPubKey: '76a914a425389bd4aea049fce4f3c0da74f28f309a008888ac',
            amount: 0.12345
        }
    ];

    var outputs = [
        {
            address: 'QSzCug8gGM6CgSFHoEMzhmxQfHjFbF2JGm',
            amount: 0.29
        },
        {
            address: 'QiZiSGsprq3sFRwPi3UxoXyQGQH5wVkK8b',
            amount: 0.02
        }
    ];

    var change = {
        address: 'QRWFY4jj7ABP1Rd3sjQpNpH9ADfHV4DyY4',
        addressIndex: 0,
        amount: 0.047
    };

    return {
        inputs: inputs,
        outputs: outputs,
        change: change
    }
}

describe('#qtum', () => {

    it('create-qtum-tx', () => {
        let data = createValidData();
        let tx = qtum.createTransaction(data);
        expect(tx).to.be.a('string').and.equals('01000000022690f970fb2d8ac2624ca6484898d4f38146acce751a4e5fb7e7aa6b74f872c7000000006b483045022100a4a712fd4e019abc18be313ae300ec3e4913fe49b51e1e732b9c28f679cf2ee5022011344f84c93136f985e37e5a71332125a6c91b1b57104e708fef1750a9203b300121035167c6fb82cbaa710c060d831076c2b64c94a5f21ca0bc5609c8cafc081a3fbcffffffffbb5965462d1c4042d617dc54442f10e3d9d88c970e95e39d593b6b108b7cdfcf000000006a473044022011b7be8bb66f41f2a858561756ec83996f35de5a280923b37f3fd365ee68191c022058273f32993b85fd856f6bad2860fc5b59351c8b69b774cfbc5a0b6a37eb12070121029f038a5aed588cee924a257ebcbfc8554084082f5a92f6eafcd2561e543ac652ffffffff033f81ba01000000001976a91446049726421140019d1384fec630dd5326b147c188ac80841e00000000001976a914f0e4da3022e215ba8752bc1083df967bfe519fb188ac60b74700000000001976a91435c302ce8eef2e2a598aca5f64bc92125ab3029c88ac00000000');
    });

    it('create-qtum-tx-without-change', () => {
        let data = createValidData();
        data.outputs[0].amount += data.change.amount;
        delete data.change
        let tx = qtum.createTransaction(data);
        expect(tx).to.be.a('string').and.equals('01000000022690f970fb2d8ac2624ca6484898d4f38146acce751a4e5fb7e7aa6b74f872c7000000006b4830450221009686c2ae64590942e7dbbcc8a834e86c8586a25944ed58f09644c002f988539302202928498dc685c9bd5a58e5efbe5865725de0453af8f70cba0aea90ba64d6c1a60121035167c6fb82cbaa710c060d831076c2b64c94a5f21ca0bc5609c8cafc081a3fbcffffffffbb5965462d1c4042d617dc54442f10e3d9d88c970e95e39d593b6b108b7cdfcf000000006a47304402204b6e3dc445dcd345b7883be4a03ae84627a545fb356335dff5ff5b184d82feb10220500e93b459c15efed3b424e8881e4a9a98a1a350130d9130bf7530c8a10d63160121029f038a5aed588cee924a257ebcbfc8554084082f5a92f6eafcd2561e543ac652ffffffff02a0380202000000001976a91446049726421140019d1384fec630dd5326b147c188ac80841e00000000001976a914f0e4da3022e215ba8752bc1083df967bfe519fb188ac00000000');
    });

    it('create-qtum-tx-but-change-addressIndex-is-invalid', () => {
        let data = createValidData();
        data.change.address = 'QSZ7ah6jaiwKpUYF1dZaj7i4U1gwLzkEwi';
        data.change.addressIndex = 1;
        expect(() => qtum.createTransaction(data)).to.throw('addressIndex of change MUST be 0.');
    });

    it('create-qtum-tx-but-input-addressIndex-is-invalid', () => {
        let data = createValidData();
        data.inputs[0].addressIndex = 5;
        expect(() => qtum.createTransaction(data)).to.throw(/invalid address/);
    });

    it('create-qtum-tx-but-fee-is-zero', () => {
        let data = createValidData();
        data.change.amount = 0.04746;
        expect(() => qtum.createTransaction(data)).to.throw(/fee is equal or less than 0/);
    });

    it('create-qtum-tx-but-fee-is-too-much', () => {
        let data = createValidData();
        data.outputs[0].amount -= 0.111;
        expect(() => qtum.createTransaction(data)).to.throw(/fee is too high/);
    });

    it('curl-call-qtum-tx', () => {
        let data = JSON.stringify(createValidData());
        console.log(`curl -X POST -H 'Content-type: application/json' -d '${data}' localhost:3000`);
    });
});
