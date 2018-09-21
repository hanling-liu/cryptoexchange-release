'use strict';

/**
 * AES 256 encrypt/decrypt
 */

const crypto = require('crypto');

function randomPassword() {
	return crypto.randomBytes(32);
}

function encrypt(message, password) {
	let
		cipher = crypto.createCipheriv('AES-256-ECB', password, ''),
		encrypted = cipher.update(message, 'utf-8', 'hex');
	return encrypted + cipher.final('hex');
}

function decrypt(encrypted, password) {
	let
		decipher = crypto.createDecipheriv('AES-256-ECB', password, ''),
		decrypted = decipher.update(encrypted, 'hex', 'utf8');
	return decrypted + decipher.final('utf8');
}

module.exports = {
	randomPassword: randomPassword,
	encrypt : encrypt,
	decrypt : decrypt
};
