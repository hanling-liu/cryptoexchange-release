'use strict';

const createVaultClient = require("./vault");

console.log('ATTENTION: START COLD WALLET...');

async function initVault() {
	let vault = createVaultClient();
	console.log('check vault status...')
	let status = await vault.status();
	console.log(`vault status: sealed=${status.apiResponse.sealed}, type=${status.apiResponse.type}, t/n=${status.apiResponse.t}/${status.apiResponse.n}`);
	if (!status.apiResponse.sealed) {
		console.error('vault is not sealed! please seal it first.');
		process.exit(1);
	}
	process._initializing = {
		_vault: vault,
		_thresholds: status.apiResponse.t,
		_sealed: true,
	};
	require('./web');
}

initVault();
