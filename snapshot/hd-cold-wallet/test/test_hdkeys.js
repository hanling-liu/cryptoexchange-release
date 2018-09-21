'use strict';

/**
 * Test HD keys. Test vector from:
 * https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki#test-vectors
 */

const
    assert = require('assert'),
    bitcoin = require('bitcoinjs-lib'),
    HDNode = bitcoin.HDNode,
    getECPair = require('../hdkey').getECPair;

describe('#hd', () => {

    it('check-import-export', () => {
        // seed '000102030405060708090a0b0c0d0e0f':
        let xprv_m = HDNode.fromBase58('xprv9s21ZrQH143K3QTDL4LXw2F7HEK3wJUD2nW2nRk4stbPy6cq3jPPqjiChkVvvNKmPGJxWUtg6LnF5kejMRNNU3TGtRBeJgk33yuGBxrMPHi');
        let xpub_m = xprv_m.neutered();
        assert.equal(xpub_m.toBase58(), 'xpub661MyMwAqRbcFtXgS5sYJABqqG9YLmC4Q1Rdap9gSE8NqtwybGhePY2gZ29ESFjqJoCu1Rupje8YtGqsefD265TMg7usUDFdp6W1EGMcet8');
        // m/0':
        let xprv_m_0h = xprv_m.deriveHardened(0);
        let xpub_m_0h = xprv_m_0h.neutered();
        assert.equal(xprv_m_0h.toBase58(), 'xprv9uHRZZhk6KAJC1avXpDAp4MDc3sQKNxDiPvvkX8Br5ngLNv1TxvUxt4cV1rGL5hj6KCesnDYUhd7oWgT11eZG7XnxHrnYeSvkzY7d2bhkJ7');
        assert.equal(xpub_m_0h.toBase58(), 'xpub68Gmy5EdvgibQVfPdqkBBCHxA5htiqg55crXYuXoQRKfDBFA1WEjWgP6LHhwBZeNK1VTsfTFUHCdrfp1bgwQ9xv5ski8PX9rL2dZXvgGDnw');
        // m/0'/1:
        let xprv_m_0h_1 = xprv_m_0h.derive(1);
        let xpub_m_0h_1 = xprv_m_0h_1.neutered();
        assert.equal(xprv_m_0h_1.toBase58(), 'xprv9wTYmMFdV23N2TdNG573QoEsfRrWKQgWeibmLntzniatZvR9BmLnvSxqu53Kw1UmYPxLgboyZQaXwTCg8MSY3H2EU4pWcQDnRnrVA1xe8fs');
        assert.equal(xpub_m_0h_1.toBase58(), 'xpub6ASuArnXKPbfEwhqN6e3mwBcDTgzisQN1wXN9BJcM47sSikHjJf3UFHKkNAWbWMiGj7Wf5uMash7SyYq527Hqck2AxYysAA7xmALppuCkwQ');
        // m/0'/1/2':
        let xprv_m_0h_1_2h = xprv_m_0h_1.deriveHardened(2);
        let xpub_m_0h_1_2h = xprv_m_0h_1_2h.neutered();
        assert.equal(xprv_m_0h_1_2h.toBase58(), 'xprv9z4pot5VBttmtdRTWfWQmoH1taj2axGVzFqSb8C9xaxKymcFzXBDptWmT7FwuEzG3ryjH4ktypQSAewRiNMjANTtpgP4mLTj34bhnZX7UiM');
        assert.equal(xpub_m_0h_1_2h.toBase58(), 'xpub6D4BDPcP2GT577Vvch3R8wDkScZWzQzMMUm3PWbmWvVJrZwQY4VUNgqFJPMM3No2dFDFGTsxxpG5uJh7n7epu4trkrX7x7DogT5Uv6fcLW5');
        // m/0'/1/2'/2:
        let xprv_m_0h_1_2h_2 = xprv_m_0h_1_2h.derive(2);
        let xpub_m_0h_1_2h_2 = xprv_m_0h_1_2h_2.neutered();
        assert.equal(xprv_m_0h_1_2h_2.toBase58(), 'xprvA2JDeKCSNNZky6uBCviVfJSKyQ1mDYahRjijr5idH2WwLsEd4Hsb2Tyh8RfQMuPh7f7RtyzTtdrbdqqsunu5Mm3wDvUAKRHSC34sJ7in334');
        assert.equal(xpub_m_0h_1_2h_2.toBase58(), 'xpub6FHa3pjLCk84BayeJxFW2SP4XRrFd1JYnxeLeU8EqN3vDfZmbqBqaGJAyiLjTAwm6ZLRQUMv1ZACTj37sR62cfN7fe5JnJ7dh8zL4fiyLHV');
        // m/0'/1/2'/2/1000000000:
        let xprv_m_0h_1_2h_2_1000000000 = xprv_m_0h_1_2h_2.derive(1000000000);
        let xpub_m_0h_1_2h_2_1000000000 = xprv_m_0h_1_2h_2_1000000000.neutered();
        assert.equal(xprv_m_0h_1_2h_2_1000000000.toBase58(), 'xprvA41z7zogVVwxVSgdKUHDy1SKmdb533PjDz7J6N6mV6uS3ze1ai8FHa8kmHScGpWmj4WggLyQjgPie1rFSruoUihUZREPSL39UNdE3BBDu76');
        assert.equal(xpub_m_0h_1_2h_2_1000000000.toBase58(), 'xpub6H1LXWLaKsWFhvm6RVpEL9P4KfRZSW7abD2ttkWP3SSQvnyA8FSVqNTEcYFgJS2UaFcxupHiYkro49S8yGasTvXEYBVPamhGW6cFJodrTHy');
    });

    it('check-derive-from-prv-and-pub', () => {
        // seed '000102030405060708090a0b0c0d0e0f':
        let xprv_m = HDNode.fromBase58('xprv9s21ZrQH143K3QTDL4LXw2F7HEK3wJUD2nW2nRk4stbPy6cq3jPPqjiChkVvvNKmPGJxWUtg6LnF5kejMRNNU3TGtRBeJgk33yuGBxrMPHi');
        let xpub_m = xprv_m.neutered();
        assert.equal(xpub_m.toBase58(), 'xpub661MyMwAqRbcFtXgS5sYJABqqG9YLmC4Q1Rdap9gSE8NqtwybGhePY2gZ29ESFjqJoCu1Rupje8YtGqsefD265TMg7usUDFdp6W1EGMcet8');
        let n = 123456 + parseInt(10000 * Math.random());
        for (let i=n-20; i<n; i++) {
            let xprv_i = xprv_m.derive(i);
            let xpub_i = xpub_m.derive(i);
            assert.equal(xprv_i.neutered().toBase58(), xpub_i.toBase58());
        }
    });

    it('check-derive', () => {
        // copy WORDS to the following URL for test vectors:
		// "hover apart tomorrow boat surge post dumb funny steel sort charge market"
		// https://iancoleman.io/bip39/#english
		const SEED = '89d3adb96ff9553c18eaad57f1f1734120ddde4984276aed0c48a199a2c2565339b430f0782428ce3bc38327da4ce78b2a225d81d4b17b1933c39f7e5203bf2b';
		let xprv_m = HDNode.fromBase58('xprv9s21ZrQH143K3bfahAVMvh53PKENDaCWcVpTX8T44rQTdp21eYNDfiq3PXzYc7TDkUwzomxjchKyRDazxi3nnp8bCaUapXGHX9KTYZwBw89');
		// m/44'/0'/0':
		assert.equal(xprv_m.deriveHardened(44).deriveHardened(0).deriveHardened(0).toBase58(),
				'xprv9yz3WDSoB8bKpRfF7aP94hn7dgwiChexdNdMV3UHGVacYxChULcafXJ3xeGuJbv9Kq8cRvj65SBc1gBwJtAuNPqETrxsZDmcSxTvNWceYv6');
        // m/44'/0'/0'/0:
        assert.equal(xprv_m.deriveHardened(44).deriveHardened(0).deriveHardened(0).derive(0).toBase58(),
                'xprvA2GSkxFPsqJQzwwSrFE6UntYwZamJyKpxqmyppNFjvDzCYXGoUULKMxAerAon6DQH9x7qnBfjx6pViPHqs92VjD6jWN4mZXD5tuoLFRsCJn')
        assert.equal(xprv_m.deriveHardened(44).deriveHardened(0).deriveHardened(0).derive(0).neutered().toBase58(),
                'xpub6FFoATnHiCriDS1uxGm6qvqHVbRFiS3gL4hadCmsJFky5LrRM1nasAGeW6hZJWBiybJxLoewBcwTdkW2AXw6bfYHeYnr9NqcMsw5Fkbd9eG')
        var ADDRESS;
		// BTC:
		// m/44'/0'/0'/0/0:
        ADDRESS = '0378f001fa19f739834f6c1e5855fdbee0f71ad4603b66f4ee4239c2e91d47d9c9';
        assert.equal(xprv_m.deriveHardened(44).deriveHardened(0).deriveHardened(0).derive(0).derive(0).neutered().getPublicKeyBuffer().toString('hex'), ADDRESS);
        assert.equal(xprv_m.deriveHardened(44).deriveHardened(0).deriveHardened(0).derive(0).neutered().derive(0).getPublicKeyBuffer().toString('hex'), ADDRESS);
        assert.equal(xprv_m.deriveHardened(44).deriveHardened(0).deriveHardened(0).derive(0).derive(0).getAddress(), '1KFgfut3qVVTzopdaJupKgk72oypFCQ8mK');
        assert.equal(xprv_m.deriveHardened(44).deriveHardened(0).deriveHardened(0).derive(0).neutered().derive(0).getAddress(), '1KFgfut3qVVTzopdaJupKgk72oypFCQ8mK');
		// m/44'/0'/0'/0/1:
		ADDRESS = '03842bbb28905339a67e1dc814ebcc5e856953b3e2a3eecb4fc44688712b1d9a8a';
        assert.equal(xprv_m.deriveHardened(44).deriveHardened(0).deriveHardened(0).derive(0).derive(1).neutered().getPublicKeyBuffer().toString('hex'), ADDRESS);
        assert.equal(xprv_m.deriveHardened(44).deriveHardened(0).deriveHardened(0).derive(0).neutered().derive(1).getPublicKeyBuffer().toString('hex'), ADDRESS);
		// m/44'/0'/0'/0/2:
		ADDRESS = '02bf1252874d8fd79748aa1d4c4b06b25be0fff37c6e80863e2e1fa8ba926c58c9';
        assert.equal(xprv_m.deriveHardened(44).deriveHardened(0).deriveHardened(0).derive(0).derive(2).neutered().getPublicKeyBuffer().toString('hex'), ADDRESS);
        assert.equal(xprv_m.deriveHardened(44).deriveHardened(0).deriveHardened(0).derive(0).neutered().derive(2).getPublicKeyBuffer().toString('hex'), ADDRESS);
		// m/44'/0'/0'/0/9:
		ADDRESS = '0251029d84e714941a95aa5a99f5f23d46a78fda5bf3b8cd2c2bd1daa547c41e76';
        assert.equal(xprv_m.deriveHardened(44).deriveHardened(0).deriveHardened(0).derive(0).derive(9).neutered().getPublicKeyBuffer().toString('hex'), ADDRESS);
        assert.equal(xprv_m.deriveHardened(44).deriveHardened(0).deriveHardened(0).derive(0).neutered().derive(9).getPublicKeyBuffer().toString('hex'), ADDRESS);
		// m/44'/0'/0'/0/19:
		ADDRESS = '033d87c1e3d0056feaa6ea1b5e175ec667ffe634838a9700bd862dc440460e7cb9';
        assert.equal(xprv_m.deriveHardened(44).deriveHardened(0).deriveHardened(0).derive(0).derive(19).neutered().getPublicKeyBuffer().toString('hex'), ADDRESS);
        assert.equal(xprv_m.deriveHardened(44).deriveHardened(0).deriveHardened(0).derive(0).neutered().derive(19).getPublicKeyBuffer().toString('hex'), ADDRESS);
        // ETH:
		// m/44'/60'/0'/0/0:
        ADDRESS = '0202f919880fec7e012c2f05306db12780e2f3e331708c7768563e73f933a93da4';
        let ethRoot = xprv_m.deriveHardened(44).deriveHardened(60).deriveHardened(0).derive(0).toBase58();
        console.log(`m/44'/60'/0'/0/0: ${ethRoot}`);
        assert.equal(xprv_m.deriveHardened(44).deriveHardened(60).deriveHardened(0).derive(0).derive(0).neutered().getPublicKeyBuffer().toString('hex'), ADDRESS);
        assert.equal(xprv_m.deriveHardened(44).deriveHardened(60).deriveHardened(0).derive(0).neutered().derive(0).getPublicKeyBuffer().toString('hex'), ADDRESS);
		// m/44'/60'/0'/0/1:
		ADDRESS = '030f799e48ef4a0bef2b20d5db24041926bed9f18797a256e7000cf67d24a5d28c';
        assert.equal(xprv_m.deriveHardened(44).deriveHardened(60).deriveHardened(0).derive(0).derive(1).neutered().getPublicKeyBuffer().toString('hex'), ADDRESS);
        assert.equal(xprv_m.deriveHardened(44).deriveHardened(60).deriveHardened(0).derive(0).neutered().derive(1).getPublicKeyBuffer().toString('hex'), ADDRESS);
        // m/44'/60'/0'/0/2:
        ADDRESS = '03cc3b278e33abe30ed8a6a1355fc3316a3e269dc48e9c7911d65023729a44caa1';
        assert.equal(xprv_m.deriveHardened(44).deriveHardened(60).deriveHardened(0).derive(0).derive(2).neutered().getPublicKeyBuffer().toString('hex'), ADDRESS);
        assert.equal(xprv_m.deriveHardened(44).deriveHardened(60).deriveHardened(0).derive(0).neutered().derive(2).getPublicKeyBuffer().toString('hex'), ADDRESS);
		// m/44'/60'/0'/0/9:
		ADDRESS = '02e78882c05f311ad9a0411653faf101d419c89c13ad20c2891bd74ced83e25683';
        assert.equal(xprv_m.deriveHardened(44).deriveHardened(60).deriveHardened(0).derive(0).derive(9).neutered().getPublicKeyBuffer().toString('hex'), ADDRESS);
        assert.equal(xprv_m.deriveHardened(44).deriveHardened(60).deriveHardened(0).derive(0).neutered().derive(9).getPublicKeyBuffer().toString('hex'), ADDRESS);
		// m/44'/60'/0'/0/19:
		ADDRESS = '032b611c90eb49c28c825173c371acadf9265d87bf1082e64cf720a7518befaa2d';
        assert.equal(xprv_m.deriveHardened(44).deriveHardened(60).deriveHardened(0).derive(0).derive(19).neutered().getPublicKeyBuffer().toString('hex'), ADDRESS);
        assert.equal(xprv_m.deriveHardened(44).deriveHardened(60).deriveHardened(0).derive(0).neutered().derive(19).getPublicKeyBuffer().toString('hex'), ADDRESS);
    });

    it('check decrypt failed', () => {
        process._password = 'xx123456789012345678901234567890';
        assert.throws(() => {
            getECPair('BTC', 1);
        });
    });

    it('check decrypt and get raw private key', () => {
        process._password = 'NB123456789012345678901234567890';
        let kp = getECPair('BTC', 1);
        assert.equal(kp.getAddress(), '1Jsw3vA2SaNgSwSKCWuEze4AJRWC2yBdKQ');
    });

    it('check decrypt and get ETH private key', () => {
        process._password = 'NB123456789012345678901234567890';
        let kp = getECPair('ETH', 1);
        assert.equal('0x' + kp.d.toHex(32), '0xbaa6a36985b28af4b3a0b904a8a09c56418d6cc3d192dd327f7bc8dfe1e23ecb');
    });
});
