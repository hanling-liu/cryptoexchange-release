'use strict';

/**
 * Test ethwallet.js.
 */

const
    eth = require('../controllers/eth'),
    expect = require('chai').expect;

// test data:

// input: index, private key, address:
// 0, 0x4513738245ff4b1171e80398dfdd059048b066db, 0x38a883a2da01620c87efe421bf7dbb30d72ab46624cd4ca45a429d6269443127
// 1, 0x15fc2c4c77f4ec9b369c998ed79381f6c9060491, 0xbaa6a36985b28af4b3a0b904a8a09c56418d6cc3d192dd327f7bc8dfe1e23ecb
// 2, 0xa8e142c3303f7c23c480fb80e71d23e8a68cd009, 0xc7df270c3c0a7caa8667d895ac42e8cd05d3693e406b6b6ec0d7a2421ec09770

// output: address, amount:
// 0x01696976b6122090de0df16ecfcd21c8a6a879a0
// 0x3d910b15b8f62ce1361419e2d5cf8f55997c2f06

// erc20: fake USD:
// address: 0x13cd4bef1fb127253ebdc0ab4f7debf810ea551a
// decimals: 2

function createValidInput() {
    return {
        gasPrice: 0.000000012,
        gasLimit: 60000,
        addressIndex: 1,
        address: '0x15fc2c4c77f4ec9b369c998ed79381f6c9060491',
        nonce: 0
    };
}

function createValidOutput() {
    return {
        address: '0x3d910b15b8f62ce1361419e2d5cf8f55997c2f06',
        amount: 0.02
    };
}

function createValidEthData() {
    return {
        input: createValidInput(),
        output: createValidOutput()
    }
}

function createValidErc20Data() {
    return {
        contract: {
            address: '0x13cd4bef1fb127253ebdc0ab4f7debf810ea551a',
            decimals: 2
        },
        input: createValidInput(),
        output: createValidOutput()
    }
}

describe('#eth', () => {

    it('to-uint256', () => {
        expect(eth.toUint256(0.001, 3)).to.be.a('string').and.equals('0000000000000000000000000000000000000000000000000000000000000001');
        expect(eth.toUint256(0.02,  2)).to.be.a('string').and.equals('0000000000000000000000000000000000000000000000000000000000000002');
        expect(eth.toUint256(0.02, 18)).to.be.a('string').and.equals('00000000000000000000000000000000000000000000000000470de4df820000');
        expect(eth.toUint256(1.02, 18)).to.be.a('string').and.equals('0000000000000000000000000000000000000000000000000e27c49886e60000');
        expect(eth.toUint256(1329.70426, 18)).to.be.a('string').and.equals('000000000000000000000000000000000000000000000048155a836517a84000');
    });

    it('create-eth-tx', () => {
        let data = createValidEthData();
        let tx = eth.createEtherTransaction(data);
        expect(tx).to.be.a('string').and.equals('0xf86b808502cb41780082ea60943d910b15b8f62ce1361419e2d5cf8f55997c2f0687470de4df820000801ca0ab717a05046cc59eb3f46a7d6759637ab0af81f6e2315f369047a184897edfcba07602390de10e837f43d5b4d7c2126f433970ee50ae666d6f290b3fc43ce7aac1');
    });

    it('create-eth-failed-gas-limit-too-low', () => {
        let data = createValidEthData();
        data.input.gasLimit = 20000;
        expect(() => eth.createEtherTransaction(data)).to.throw();
    });

    it('create-eth-failed-gas-price-too-low', () => {
        let data = createValidEthData();
        data.input.gasPrice = 0.0000000005;
        expect(() => eth.createEtherTransaction(data)).to.throw();
    });

    it('create-eth-failed-gas-price-too-high', () => {
        let data = createValidEthData();
        data.input.gasPrice = 0.0000011;
        expect(() => eth.createEtherTransaction(data)).to.throw();
    });

    it('create-eth-failed-invalid-nonce', () => {
        let data = createValidEthData();
        data.input.nonce = -1;
        expect(() => eth.createEtherTransaction(data)).to.throw();
    });

    it('create-eth-failed-index-not-match', () => {
        let data = createValidEthData();
        data.input.addressIndex = 2;
        expect(() => eth.createEtherTransaction(data)).to.throw(/invalid address/);
    });

    it('create-eth-failed-missing-input', () => {
        let data = createValidEthData();
        delete data.input;
        expect(() => eth.createEtherTransaction(data)).to.throw();
    });

    it('create-eth-failed-missing-output', () => {
        let data = createValidEthData();
        delete data.output;
        expect(() => eth.createEtherTransaction(data)).to.throw();
    });

    it('create-eth-failed-invalid-output-address', () => {
        let data = createValidEthData();
        data.output.address = '0x1234560000ff';
        expect(() => eth.createEtherTransaction(data)).to.throw();
    });

    it('create-eth-failed-invalid-output-amount', () => {
        let data = createValidEthData();
        data.output.amount = -1;
        expect(() => eth.createEtherTransaction(data)).to.throw();
    });

    it('create-erc20-tx', () => {
        let data = createValidErc20Data();
        let tx = eth.createErc20Transaction(data);
        expect(tx).to.be.a('string').and.equals('0xf8a9808502cb41780082ea609413cd4bef1fb127253ebdc0ab4f7debf810ea551a80b844a9059cbb0000000000000000000000003d910b15b8f62ce1361419e2d5cf8f55997c2f0600000000000000000000000000000000000000000000000000000000000000021ba009c73c90d2057ff4eeba08e6630ba757f9be1d70b0bdbbb911f0715017c7d6b3a047a82101a81de2da30283edefa865998cfc5091fbba988ecc1b99c348389eb21');
    });

    it('create-erc20-failed-missing-contract', () => {
        let data = createValidErc20Data();
        delete data.contract;
        expect(() => eth.createErc20Transaction(data)).to.throw();
    });

    it('create-erc20-failed-invalid-contract-address', () => {
        let data = createValidErc20Data();
        data.contract.address = '0x1234567890ff';
        expect(() => eth.createErc20Transaction(data)).to.throw();
    });

    it('create-erc20-failed-invalid-contract-decimals', () => {
        let data = createValidErc20Data();
        data.contract.decimals = 25;
        expect(() => eth.createErc20Transaction(data)).to.throw();
    });

});
