'use strict';

const VaultClient = require("nanvc");

module.exports = () => {
	if (!process.env.VAULT_ADDR || !process.env.VAULT_ADDR.startsWith('https://')) {
		console.error(`Invalid env VAULT_ADDR: ${process.env.VAULT_ADDR}`);
		process.exit(1);
	}
	console.log(`Set vault addr: ${process.env.VAULT_ADDR}`);
	let client = new VaultClient(process.env.VAULT_ADDR);
	client.checkSucceeded = (resp) => {
		if (!resp || !resp.succeeded) {
			throw new Error('Vault response is not succeeded.');
		}
	};
	return client;
};
