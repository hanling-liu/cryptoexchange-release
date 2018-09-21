'use strict';

const
	notp = require('notp'),
    bip39 = require('bip39'),
    bitcoin = require('bitcoinjs-lib'),
    HDNode = bitcoin.HDNode,
	aes256 = require('../aes256'),
	constants = require('../constants');

const TOKEN_FORM = `
<html><body>
<form method="post" action="/initToken">
	<p>Token: <input name="token" type="password" required maxlength="100" autocomplete="off"></p>
	<p><button type="submit">Submit</button></p>
</form>
</body></html>`;

const PASSWORD_FORM = `
<html><body>
<form method="post" action="/initPassword">
	<p>Username: <input name="username" type="text" required maxlength="100" autocomplete="off"></p>
	<p>Password: <input name="password" type="password" required maxlength="100" autocomplete="off"></p>
	<p>GA: <input name="ga" type="text" required pattern="[0-9]{6}" type="text" maxlength="6" autocomplete="off"></p>
	<p><button type="submit">Submit</button></p>
</form>
</body></html>`;

function hiddenKey(s) {
	return s.substring(0, 8) + '******' + s.substring(s.length - 4);
}

function generateXprv(hdWords, hdPassword) {
	if (!bip39.validateMnemonic(hdWords)) {
		throw new Error('invalid mnemonic words.');
	}
	console.log('generating HD extended keys...');
	let
		seedHex = bip39.mnemonicToSeedHex(hdWords, hdPassword),
		xprvRoot = HDNode.fromSeedHex(seedHex),
		xpubRoot = xprvRoot.neutered();
	console.log('Root xprv: ', hiddenKey(xprvRoot.toBase58()));
	console.log('Root xpub: ', hiddenKey(xpubRoot.toBase58()));
	let
		password = aes256.randomPassword(),
		hdPrivateKeys = {};
	for (let coin in constants.COINS) {
		let
			n = constants.COINS[coin],
			p = `m/44'/${n}'/0'/0`,
			xprv = xprvRoot.derivePath(p);
		console.log(`${coin} ${p} xprv: `, hiddenKey(xprv.toBase58()));
		console.log(`${coin} ${p} xpub: `, xprv.neutered().toBase58());
		// encrypt by random generated password:
		hdPrivateKeys[coin] = aes256.encrypt(xprv.toBase58(), password);
	}
	return {
		password: password,
		hdPrivateKeys: hdPrivateKeys
	};
}

function isInitialized(ctx) {
	if (!process._initializing) {
		ctx.response.type = 'text/html';
		ctx.response.body = '<html><body><p>Running...</p></body></html>';
		return true;
	}
	return false;
}

async function inputTokenOrPassword(ctx, next) {
	if (isInitialized(ctx)) {
		return;
	}
	ctx.response.type = 'text/html';
	ctx.response.body = process._initializing._sealed ? TOKEN_FORM : PASSWORD_FORM;
}

async function initToken(ctx, next) {
	if (isInitialized(ctx)) {
		return;
	}
	try {
		let token = ctx.request.body.token;
		// try unseal:
		let resp = await process._initializing._vault.unseal({
			key: token
		});
		if (!resp.succeeded) {
			throw new Error('ERROR: ' + resp.errorMessage);
		}
		if (!resp.apiResponse.sealed) {
			// unsealed successfully:
			process._initializing._sealed = false;
		}
		ctx.response.type = 'text/html';
		ctx.response.body = `<html><body><p>seal: ${process._initializing._sealed}, <a href="/">continue</a></p></body></html>`;
	} catch (e) {
		ctx.response.body = `<html><body><p style="color: #f00">${e}</p></body></html>`;
	}
}

async function initPassword(ctx, next) {
	if (isInitialized(ctx)) {
		return;
	}
	let
		username = ctx.request.body.username,
		password = ctx.request.body.password,
		ga = ctx.request.body.ga;
	ctx.response.type = 'text/html';
	try {
		// try login:
		let loginResp = await process._initializing._vault.write('auth/userpass/login/' + username, {
			password: password
		});
		if (!loginResp.succeeded) {
			throw new Error('Failed login: ' + loginResp.errorMessage);
		}
		process._initializing._vault.token = loginResp.apiResponse.auth.client_token;
		// read hd-keys:
		let secretResp = await process._initializing._vault.read(constants.KEY_PATH);
		if (!secretResp.succeeded) {
			throw new Error('Failed to read hd key: ' + secretResp.errorMessage);
		}
		if (secretResp.apiResponse && secretResp.apiResponse.data
				&& secretResp.apiResponse.data[constants.KEY_MNEMONIC]
				&& secretResp.apiResponse.data[constants.KEY_PASSWORD]
				&& secretResp.apiResponse.data[constants.KEY_GA]) {
			// check GA:
			if (!notp.totp.verify(ga, secretResp.apiResponse.data[constants.KEY_GA])) {
				throw new Error('Invalid GA');
			}
			// generate xprv:
			let data = generateXprv(secretResp.apiResponse.data[constants.KEY_MNEMONIC], secretResp.apiResponse.data[constants.KEY_PASSWORD]);
			process._password = data.password;
			process._hdPrivateKeys = data.hdPrivateKeys;
			// remove vault info:
			process._initializing = undefined;
		} else {
			throw new Error('Cannot read hd key.');
		}
		ctx.response.body = '<html><body><p>initialized ok.</p></body></html>';
	} catch (e) {
		ctx.response.body = `<html><body><p style="color: #f00">${e}</p></body></html>`;
	}
}

module.exports = {
	'GET /' : inputTokenOrPassword,
	'POST /initToken' : initToken,
	'POST /initPassword' : initPassword
};
