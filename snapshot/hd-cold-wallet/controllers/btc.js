'use strict';

const bitcoin = require('bitcoinjs-lib'),
	ECPair = bitcoin.ECPair,
	TransactionBuilder = bitcoin.TransactionBuilder,
	schema = require('../schema'),
	getECPair = require('../hdkey').getECPair;

const BTC_ADDRESS = {
		type : 'string',
		pattern : '^[13][0-9a-zA-Z]{30,36}$'
	},
	BTC_INPUT = {
		type : 'object',
		properties : {
			addressIndex : schema.PROPERTY.HD_INDEX,
			address : BTC_ADDRESS,
			txId : schema.PROPERTY.HASH256,
			outputIndex : schema.PROPERTY.INDEX,
			scriptPubKey : schema.PROPERTY.HEX,
			amount : schema.PROPERTY.AMOUNT
		},
		required : [ 'addressIndex', 'address', 'txId', 'outputIndex', 'scriptPubKey', 'amount' ]
	},
	BTC_OUTPUT = {
		type : 'object',
		properties : {
			address : BTC_ADDRESS,
			amount : schema.PROPERTY.AMOUNT
		},
		required : [ 'address', 'amount' ]
	},
	BTC_CHANGE = {
		type : 'object',
		properties : {
			addressIndex : schema.PROPERTY.HD_INDEX,
			address : BTC_ADDRESS,
			amount : schema.PROPERTY.AMOUNT
		},
		required : [ 'addressIndex', 'address', 'amount' ]
	};

const env = schema.createSchema({
	BTC : {
		type : 'object',
		properties : {
			inputs : {
				type : 'array',
				items : BTC_INPUT,
				minItems : 1
			},
			outputs : {
				type : 'array',
				items : BTC_OUTPUT,
				minItems : 1
			},
			change : BTC_CHANGE
		},
		required : [ 'inputs', 'outputs' ]
	}
});

const MAX_FEE = 0.01;

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

function toBTCAddress(ecPair) {
	return ecPair.getAddress();
}

function checkBTCAddress(ecPair, actualAddress) {
	if (toBTCAddress(ecPair) !== actualAddress) {
		throw new Error(`invalid address: ${actualAddress}`);
	}
}

function buildTransaction(inputs, outputs, change) {
	let txb = new TransactionBuilder();
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
	env.validate('BTC', data);
	checkFee(data.inputs, data.outputs, data.change);
	// find private key for each input utxo:
	for (let utxo of data.inputs) {
		let ecPair = getECPair('BTC', utxo.addressIndex);
		checkBTCAddress(ecPair, utxo.address);
		utxo.ecPair = ecPair; }
	// check change:
	if (data.change) {
		if (data.change.addressIndex !== 0) {
			throw new Error('addressIndex of change MUST be 0.');
		}
		let ecPair = getECPair('BTC', data.change.addressIndex);
		checkBTCAddress(ecPair, data.change.address);
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

	'POST /BTC' : async (ctx, next) => {
		let tx = createTransaction(ctx.request.body);
		ctx.rest({
			tx : tx
		});
	},

	'POST /BCH' : async (ctx, next) => {
		let tx = createTransaction(ctx.request.body);
		ctx.rest({
			tx : tx
		});
	}
};