'use strict';

const bitcoin = require('bitcoinjs-lib'),
	ECPair = bitcoin.ECPair,
	TransactionBuilder = bitcoin.TransactionBuilder,
	schema = require('../schema'),
	getECPair = require('../hdkey').getECPair;

const LTC_ADDRESS = {
		type : 'string',
		pattern : '^[3mnL][0-9a-zA-Z]{30,36}$'
	},
	LTC_INPUT = {
		type : 'object',
		properties : {
			addressIndex : schema.PROPERTY.HD_INDEX,
			address : LTC_ADDRESS,
			txId : schema.PROPERTY.HASH256,
			outputIndex : schema.PROPERTY.INDEX,
			scriptPubKey : schema.PROPERTY.HEX,
			amount : schema.PROPERTY.AMOUNT
		},
		required : [ 'addressIndex', 'address', 'txId', 'outputIndex', 'scriptPubKey', 'amount' ]
	},
	LTC_OUTPUT = {
		type : 'object',
		properties : {
			address : LTC_ADDRESS,
			amount : schema.PROPERTY.AMOUNT
		},
		required : [ 'address', 'amount' ]
	},
	LTC_CHANGE = {
		type : 'object',
		properties : {
			addressIndex : schema.PROPERTY.HD_INDEX,
			address : LTC_ADDRESS,
			amount : schema.PROPERTY.AMOUNT
		},
		required : [ 'addressIndex', 'address', 'amount' ]
	};

const env = schema.createSchema({
	LTC : {
		type : 'object',
		properties : {
			inputs : {
				type : 'array',
				items : LTC_INPUT,
				minItems : 1
			},
			outputs : {
				type : 'array',
				items : LTC_OUTPUT,
				minItems : 1
			},
			change : LTC_CHANGE
		},
		required : [ 'inputs', 'outputs' ]
	}
});

const MAX_FEE = 0.01;

const getLTCECPair = function(index) {
	return getECPair('LTC', index, LTC_NETWORK);
}

const LTC_NETWORK = {
	messagePrefix : '\x19Litecoin Signed Message:\n',
	bip32 : {
		public : 0x0488b21e,
		private : 0x0488ade4,
	},
	pubKeyHash : 0x30,
	scriptHash : 0x32,
	wif : 0xb0
};

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

function toLTCAddress(ecPair) {
	return ecPair.getAddress();
}

function checkLTCAddress(ecPair, actualAddress) {
	if (toLTCAddress(ecPair) !== actualAddress) {
		throw new Error(`invalid address: ${actualAddress}`);
	}
}

function buildTransaction(inputs, outputs, change) {
	let txb = new TransactionBuilder(LTC_NETWORK);
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
	env.validate('LTC', data);
	checkFee(data.inputs, data.outputs, data.change);
	// find private key for each input utxo:
	for (let utxo of data.inputs) {
		let ecPair = getECPair('LTC', utxo.addressIndex, LTC_NETWORK);
		checkLTCAddress(ecPair, utxo.address);
		utxo.ecPair = ecPair; }
	// check change:
	if (data.change) {
		if (data.change.addressIndex !== 0) {
			throw new Error('addressIndex of change MUST be 0.');
		}
		let ecPair = getECPair('LTC', data.change.addressIndex, LTC_NETWORK);
		checkLTCAddress(ecPair, data.change.address);
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
	getLTCECPair : getLTCECPair,

	createTransaction : createTransaction,

	'POST /LTC' : async (ctx, next) => {
		let tx = createTransaction(ctx.request.body);
		ctx.rest({
			tx : tx
		});
	},
};