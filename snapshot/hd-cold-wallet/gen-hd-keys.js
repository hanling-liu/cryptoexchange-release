'use strict';

/**
 * Generate HD keys and write into vault. Skip generation if exist.
 */

const
	_ = require('lodash'),
	inquirer = require('inquirer'),
	crypto = require("crypto"),
	base32 = require('thirty-two'),
    bip39 = require('bip39'),
    bitcoin = require('bitcoinjs-lib'),
    HDNode = bitcoin.HDNode,
    constants = require('./constants'),
    vault = require("./vault")();

function hiddenMnemonic(s) {
	let ss = s.split(' ');
	return ss[0] + ' ' + ss[1] + ' ' + ss[2] + ' ... ' + ss[ss.length - 1];
}

function hiddenPassword(s) {
	return s.substring(0, 4) + '******' + s.substring(s.length - 4);
}

function hiddenKey(s) {
	return s.substring(0, 8) + '******' + s.substring(s.length - 4);
}

function encodeGA(s) {
	return 'otpauth://totp/HDColdWallet?secret=' + base32.encode(s).toString().replace(/=/g, '');
}

function generateXpub(hdWords, hdPassword) {
	if (!bip39.validateMnemonic(hdWords)) {
		console.error('invalid mnemonic words.');
		process.exit(1);
	}
	console.log('generating HD extended keys...');
	let
		seedHex = bip39.mnemonicToSeedHex(hdWords, hdPassword),
		xprvRoot = HDNode.fromSeedHex(seedHex),
		xpubRoot = xprvRoot.neutered();
	console.log('Root xprv: ', hiddenKey(xprvRoot.toBase58()));
	console.log('Root xpub: ', hiddenKey(xpubRoot.toBase58()));
	for (let coin in constants.COINS) {
		let
			n = constants.COINS[coin],
			p = `m/44'/${n}'/0'/0`,
			xprv = xprvRoot.derivePath(p);
		console.log(`${coin} ${p} xprv: `, hiddenKey(xprv.toBase58()));
		console.log(`${coin} ${p} xpub: `, xprv.neutered().toBase58());
	}
	console.log(`you can safely copy the coins' xpub keys.`);
}

async function genHDKeys() {
	let
		statusReponse, hdResponse;
	// check unsealed:
	statusReponse = await vault.status();
	vault.checkSucceeded(statusReponse);
	if (statusReponse.apiResponse.sealed) {
		console.error('ERROR: vault is sealed! please unseal it first.');
		process.exit(1);
	}
	console.log(`vault status: sealed=${statusReponse.apiResponse.sealed}, type=${statusReponse.apiResponse.type}, t/n=${statusReponse.apiResponse.t}/${statusReponse.apiResponse.n}`);
	// input token:
	let answers = await inquirer.prompt([
        {
            type: 'password',
            message: 'enter vault token:',
            name: 'token',
            mask: '*',
            validate: () => true
        }
    ]);
	vault.token = answers.token;
	// try read mnemonic and password for HD master xprv:
	hdResponse = await vault.read(constants.KEY_PATH);
	if (hdResponse.succeeded && hdResponse.apiResponse
			&& hdResponse.apiResponse.data[constants.KEY_MNEMONIC]
			&& hdResponse.apiResponse.data[constants.KEY_PASSWORD]
			&& hdResponse.apiResponse.data[constants.KEY_GA])
	{
		console.error('ERROR: mnemonic and password are already set in vault.');
		console.log('exist mnemonic: ' + hiddenMnemonic(hdResponse.apiResponse.data[constants.KEY_MNEMONIC]));
		console.log('exist password: ' + hiddenPassword(hdResponse.apiResponse.data[constants.KEY_PASSWORD]));
		console.log('exist GA: ' + encodeGA(hdResponse.apiResponse.data[constants.KEY_GA]));
		generateXpub(hdResponse.apiResponse.data[constants.KEY_MNEMONIC], hdResponse.apiResponse.data[constants.KEY_PASSWORD]);
		process.exit(1);
	}
	if (!hdResponse.succeeded && hdResponse.httpStatusCode!==404) {
		console.error('ERROR: ' + hdResponse.errorMessage);
		process.exit(1);
	}
	console.log('generate new mnemonic, password and ga...');
	let
		mnemonic = bip39.generateMnemonic(256),
		password = crypto.randomBytes(32).toString('hex'),
		ga = crypto.randomBytes(16).toString('hex');
	console.log('generated mnemoic: ' + hiddenMnemonic(mnemonic));
	console.log('generated password: ' + hiddenPassword(password));
	console.log('generated GA: ' + encodeGA(ga));
	console.log('writing mnemonic, password and GA into vault...');
	let data = {};
	data[constants.KEY_MNEMONIC] = mnemonic;
	data[constants.KEY_PASSWORD] = password;
	data[constants.KEY_GA] = ga;
	hdResponse = await vault.write(constants.KEY_PATH, data);
	// check:
	if (!hdResponse.succeeded) {
		console.error('ERROR: failed to write mnemonic and password into vault!');
		process.exit(1);
	}
	console.log('wrote mnemonic: ' + hiddenMnemonic(data[constants.KEY_MNEMONIC]));
	console.log('wrote password: ' + hiddenPassword(data[constants.KEY_PASSWORD]));
	console.log('wrote GA: ' + encodeGA(data[constants.KEY_GA]));
	generateXpub(data[constants.KEY_MNEMONIC], data[constants.KEY_PASSWORD]);
}

genHDKeys();
