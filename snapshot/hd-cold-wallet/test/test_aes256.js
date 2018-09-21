'use strict';

/**
 * Test aes256.js.
 */

const
    aes256 = require('../aes256'),
    expect = require('chai').expect;

describe('#aes-256', () => {

    it('encrypt-and-decrypt-msg', () => {
        let
            message = 'Hello, I am to be encrypted!',
            password = aes256.randomPassword(),
            encrypted = aes256.encrypt(message, password);
        console.log(`Encrypted:\n${encrypted}`);
        let decrypted = aes256.decrypt(encrypted, password);
        expect(decrypted).to.be.a('string').and.equal(message);
    });

    it('encrypt-and-decrypt-xprv', () => {
        let
            message = 'xprvA2GSkxFPsqJQzwwSrFE6UntYwZamJyKpxqmyppNFjvDzCYXGoUULKMxAerAon6DQH9x7qnBfjx6pViPHqs92VjD6jWN4mZXD5tuoLFRsCJn',
            password = aes256.randomPassword(),
            encrypted = aes256.encrypt(message, password);
        console.log(`Encrypted:\n${encrypted}`);
        let decrypted = aes256.decrypt(encrypted, password);
        expect(decrypted).to.be.a('string').and.equal(message);
    });

    it('encrypt-and-decrypt-failed', () => {
        let
            message = 'xprvA2GSkxFPsqJQzwwSrFE6UntYwZamJyKpxqmyppNFjvDzCYXGoUULKMxAerAon6DQH9x7qnBfjx6pViPHqs92VjD6jWN4mZXD5tuoLFRsCJn',
            password = aes256.randomPassword(),
            encrypted = aes256.encrypt(message, password);
        expect(() => {
            aes256.decrypt(encrypted, aes256.randomPassword());
        }).to.throw();
    });
});
