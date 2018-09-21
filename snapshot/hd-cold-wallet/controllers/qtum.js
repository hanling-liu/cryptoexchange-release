'use strict';

const bs58 = require('bs58'),
	bitcoin = require('bitcoinjs-lib'),
	ECPair = bitcoin.ECPair,
	TransactionBuilder = bitcoin.TransactionBuilder,
	apiSchema = require('../api_schema'),
	getECPair = require('../hdkey').getECPair;

const MAX_FEE = 0.1;

const QTUM_NETWORK = {
	messagePrefix : '\x15Qtum Signed Message:\n',
	bech32 : 'bc',
	bip32 : {
		public : 0x0488b21e,
		private : 0x0488ade4
	},
	pubKeyHash : 0x3a,
	scriptHash : 0x32,
	wif : 0x80
}

function checkFee(inputs, outputs, change) {
	let total_inputs = inputs.map(utxo => utxo.amount).reduce((ax, x) => ax + x);
	let total_outputs = outputs.map(to => to.amount).reduce((ax, x) => ax + x);
	if (change) {
		total_outputs = total_outputs + change.amount;
	}
	let fee = total_inputs - total_outputs;
	console.log(`transaction fee = ${total_inputs} - ${total_outputs} = ${fee}`);
	if (fee <= 0) {
		throw new Error('fee is equal or less than 0: ' + fee);
	}
	if (fee > MAX_FEE) {
		throw new Error('fee is too high: ' + fee);
	}
}

function toSatoshis(amount) {
	return parseInt(amount * 1e8 + 0.5);
}

function toQTUMAddress(ecPair) {
	let h160 = bitcoin.crypto.hash160(ecPair.getPublicKeyBuffer()),
		preH160 = Buffer.concat([ Buffer.from('3a', 'hex'), h160 ]),
		checksum = bitcoin.crypto.hash256(preH160).slice(0, 4),
		all = Buffer.concat([ preH160, checksum ]);
	return bs58.encode(all);
}

function checkQTUMAddress(ecPair, actualAddress) {
	if (toQTUMAddress(ecPair) !== actualAddress) {
		throw new Error(`invalid address: ${actualAddress}`);
	}
}

function buildTransaction(inputs, outputs, change) {
	let txb = new TransactionBuilder(QTUM_NETWORK);
	inputs.forEach(utxo => {
		txb.addInput(utxo.txId, utxo.outputIndex);
	});
	outputs.forEach(to => {
		txb.addOutput(to.address, toSatoshis(to.amount));
	});
	if (change) {
		txb.addOutput(change.address, toSatoshis(change.amount));
	}
	for (let i = 0; i < inputs.length; i++) {
		txb.sign(i, inputs[i].ecPair);
	}
	return txb.build().toHex();
}

function createTransaction(data) {
	console.log(`create transaction:
${JSON.stringify(data, null, '  ')}`);
	apiSchema.validate('QTUM', data);
	checkFee(data.inputs, data.outputs, data.change);
	// find private key for each input utxo:
	for (let utxo of data.inputs) {
		let ecPair = getECPair('QTUM', utxo.addressIndex);
		checkQTUMAddress(ecPair, utxo.address);
		ecPair.network = QTUM_NETWORK;
		utxo.ecPair = ecPair; }
	// check change:
	if (data.change) {
		if (data.change.addressIndex !== 0) {
			throw new Error('addressIndex of change MUST be 0.');
		}
		let ecPair = getECPair('QTUM', data.change.addressIndex);
		checkQTUMAddress(ecPair, data.change.address);
		ecPair.network = QTUM_NETWORK;
		data.change.ecPair = ecPair;
	}
	// sign transaction:
	let tx = buildTransaction(data.inputs, data.outputs, data.change);
	console.log(`-- BEGIN TX --:
${tx}
-- END TX --`);
	return tx;
}

module.exports = {
	createTransaction : createTransaction,

	'POST /QTUM' : async (ctx, next) => {
		let tx = createTransaction(ctx.request.body);
		ctx.rest({
			tx : tx
		});
	},

	'POST /QRC20' : async (ctx, next) => {
		let tx = 'TODO';
		ctx.rest({
			tx : tx
		});
	}
};