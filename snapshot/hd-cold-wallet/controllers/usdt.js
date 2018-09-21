'use strict';

const
	bitcoin = require('bitcoinjs-lib'),
	nullData = bitcoin.script.nullData,
	TransactionBuilder = bitcoin.TransactionBuilder,
	schema = require('../schema'),
	getECPair = require('../hdkey').getECPair;

const
	USDT_ADDRESS = {
		type : 'string',
		pattern : '^[13][0-9a-zA-Z]{30,36}$',
	},
	USDT_INPUT = {
		type : 'object',
		properties : {
			addressIndex : schema.PROPERTY.HD_INDEX,
			address : USDT_ADDRESS,
			txId : schema.PROPERTY.HASH256,
			outputIndex : schema.PROPERTY.INDEX,
			scriptPubKey : schema.PROPERTY.HEX,
			amount : schema.PROPERTY.AMOUNT
		},
		required : [ 'addressIndex', 'address', 'txId', 'outputIndex', 'scriptPubKey', 'amount' ]
	},
	USDT_OUTPUT = {
		type : 'object',
		properties : {
			address : USDT_ADDRESS,
			amount : schema.PROPERTY.AMOUNT
		},
		required : [ 'address', 'amount' ]
	},
	USDT_CHANGE = {
		type : 'object',
		properties : {
			addressIndex : schema.PROPERTY.HD_INDEX,
			address : USDT_ADDRESS,
			amount : schema.PROPERTY.AMOUNT
		},
		required : [ 'addressIndex', 'address', 'amount' ]
	};

const
	env = schema.createSchema({
	USDT : {
		type : 'object',
		properties : {
			inputs : {
				type : 'array',
				items : USDT_INPUT,
				minItems : 1
			},
			outputs : {
				type : 'array',
				items : USDT_OUTPUT,
				minItems : 1
			},
			change : USDT_CHANGE
		},
		required : [ 'inputs', 'outputs' ]
	}
});

const
	USDT_PROP_ID = 31,
	SMALL_BTC = 546,
	MAX_FEE = 0.01;

function checkFee(inputs, outputs, change) {
	let total_inputs = inputs.map(utxo => utxo.amount).reduce((ax, x) => ax + x);
	// let total_outputs = outputs.map(to => to.amount).reduce((ax, x) => ax + x);
	let total_outputs = 0;
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

function checkUSDTAddress(ecPair, actualAddress) {
	if (ecPair.getAddress() !== actualAddress) {
		throw new Error(`invalid address: ${actualAddress}`);
	}
}

function padding(num, size) {
	let s = String(num);
	while (s.length < (size || 2)) {
		s = '0' + s;
	}
	return s;
}

function getPayload(propertyId, amount) {
	let prefix = '6f6d6e69';
	return prefix + padding(propertyId.toString(16), 16) + padding(amount.toString(16), 16);
}

function buildTransaction(inputs, outputs, change) {
	let txb = new TransactionBuilder();
	inputs.forEach(utxo => {
		txb.addInput(utxo.txId, utxo.outputIndex);
	});
	if (change) {
		txb.addOutput(change.address, toSatoshis(change.amount));
	}
	outputs.forEach(to => {
		txb.addOutput(to.address, SMALL_BTC);
	});
	let propertyId = USDT_PROP_ID;
	let payload = getPayload(propertyId, toSatoshis(outputs[0].amount));
	let dataScript = nullData.output.encode(Buffer.from(payload, 'hex'));
	txb.addOutput(dataScript, 0);
	for (let i = 0; i < inputs.length; i++) {
		txb.sign(i, inputs[i].ecPair);
	}
	return txb.build().toHex();
}

function createTransaction(data) {
	console.log(`create transaction: ${JSON.stringify(data, null, '  ')}`);
	env.validate('USDT', data);
	checkFee(data.inputs, data.outputs, data.change);
	// find private key for each input utxo:
	for (let utxo of data.inputs) {
		let ecPair = getECPair('BTC', utxo.addressIndex);
		checkUSDTAddress(ecPair, utxo.address);
		utxo.ecPair = ecPair; }
	// check change:
	if (data.change) {
		if (data.change.addressIndex !== 0) {
			throw new Error('addressIndex of change MUST be 0.');
		}
		let ecPair = getECPair('BTC', data.change.addressIndex);
		checkUSDTAddress(ecPair, data.change.address);
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

	'POST /USDT' : async (ctx, next) => {
		let tx = createTransaction(ctx.request.body);
		ctx.rest({
			tx : tx
		});
	},
};