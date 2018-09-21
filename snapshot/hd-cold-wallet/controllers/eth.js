'use strict';

const schema = require('../schema'),
	getECPair = require('../hdkey').getECPair,
	BigNumber = require('bignumber.js'),
	EthereumTx = require('ethereumjs-tx'),
	ethereumUtil = require('ethereumjs-util'),
	privateToAddress = ethereumUtil.privateToAddress;

const ETH_ADDRESS = { // ethereum address (all lower case):
		type : 'string',
		pattern : '^0x[0-9a-f]{40}$'
	},
	GAS_PRICE = { // gas price in ether: minimum = 0.000000001 ether = 1 gwei, maximum = 0.000001 ether = 1000 gwei
		type : 'number',
		minimum : 0.000000001,
		maximum : 0.000001
	},
	GAS_LIMIT = { // gas limit: 21000 ~ 0x7fffffff
		type : 'integer',
		minimum : 21000,
		maximum : 0x7fffffff
	},
	NONCE = { // ethereum nonce
		type : 'integer',
		minimum : 0,
		maximum : 0x7fffffff
	},
	ETH_CONTRACT = { // ethereum contract
		type : 'object',
		properties : {
			address : ETH_ADDRESS,
			decimals : {
				type : 'integer',
				minimum : 0,
				maximum : 24
			}
		},
		required : [ 'address', 'decimals' ]
	},
	ETH_INPUT = { // eth input
		type : 'object',
		properties : {
			gasPrice : GAS_PRICE,
			gasLimit : GAS_LIMIT,
			addressIndex : schema.PROPERTY.HD_INDEX,
			address : ETH_ADDRESS,
			nonce : NONCE
		},
		required : [ 'gasPrice', 'addressIndex', 'address', 'nonce' ]
	},
	ETH_OUTPUT = { // eth output
		type : 'object',
		properties : {
			address : ETH_ADDRESS,
			amount : schema.PROPERTY.AMOUNT
		},
		required : [ 'address', 'amount' ]
	};

const env = schema.createSchema({
	ETH : {
		type : 'object',
		properties : {
			input : ETH_INPUT,
			output : ETH_OUTPUT
		},
		required : [ 'input', 'output' ]
	},
	ERC20 : {
		type : 'object',
		properties : {
			contract : ETH_CONTRACT,
			input : ETH_INPUT,
			output : ETH_OUTPUT
		},
		required : [ 'contract', 'input', 'output' ]
	}
});

function toHex(num) {
	return '0x' + num.toString(16);
}

function toWei(etherValue) {
	let n = etherValue * 1e18;
	return '0x' + parseInt(n).toString(16);
}

function toUint256(value, decimals) {
	let n = new BigNumber(value);
	for (let i = 0; i < decimals; i++) {
		n = n.times(10);
	}
	n = n.integerValue(); // default to HALF_UP
	return prependZeros(n.toString(16));
}

function prependZeros(hex) {
	// prepend '0':
	while (hex.length < 64) {
		hex = '0' + hex;
	}
	return hex;
}

function toETHAddress(ecPair) {
	let addr = privateToAddress(Buffer.from(ecPair.d.toHex(32), 'hex'));
	return '0x' + addr.toString('hex');
}

function checkETHAddress(ecPair, actualAddress) {
	if (toETHAddress(ecPair) !== actualAddress) {
		throw new Error(`invalid address: ${actualAddress}`);
	}
}

function buildTransaction(rawTx, privateKey) {
	console.log(`eth tx:
${JSON.stringify(rawTx, null, '  ')}`);
	let tx = new EthereumTx(rawTx);
	tx.sign(Buffer.from(privateKey, 'hex'));
	if (!tx.verifySignature()) {
		throw new Error('Verify signature failed.');
	}
	let hexTx = '0x' + tx.serialize().toString('hex');
	console.log(`-- BEGIN TX --:
${hexTx}
-- END TX --`);
	return hexTx;
}

function createEtherTransaction(data) {
	console.log(`create transaction: 
 ${JSON.stringify(data, null, '  ')}`);
	env.validate('ETH', data);
	let ecPair = getECPair('ETH', data.input.addressIndex);
	checkETHAddress(ecPair, data.input.address);
	let rawTx = {
		nonce : data.input.nonce,
		from : data.input.address,
		to : data.output.address,
		gasPrice : toWei(data.input.gasPrice),
		gasLimit : toHex(data.input.gasLimit),
		value : toWei(data.output.amount),
		data : '0x'
	};
	return buildTransaction(rawTx, ecPair.d.toHex(32));
}

function createErc20Transaction(data) {
	console.log(`create ERC20 transaction: 
 ${JSON.stringify(data, null, '  ')}`);
	env.validate('ERC20', data);
	let ecPair = getECPair('ETH', data.input.addressIndex);
	checkETHAddress(ecPair, data.input.address);
	let rawTx = {
		nonce : data.input.nonce,
		from : data.input.address,
		to : data.contract.address, // NOTE: to contract address
		gasPrice : toWei(data.input.gasPrice),
		gasLimit : toHex(data.input.gasLimit),
		value : '0x00', // transfer 0 ether
		data : '0xa9059cbb' // method 'transfer'
			+ prependZeros(data.output.address.substring(2)) // address _to
			+ toUint256(data.output.amount, data.contract.decimals) // uint256 _value
	};
	console.log(prependZeros(data.output.address.substring(2)));
	console.log(toUint256(data.output.amount, data.contract.decimals));
	return buildTransaction(rawTx, ecPair.d.toHex(32));
}

module.exports = {
	createEtherTransaction : createEtherTransaction,

	createErc20Transaction : createErc20Transaction,

	toUint256 : toUint256,

	'POST /ETH' : async (ctx, next) => {
		let tx = createEtherTransaction(ctx.request.body);
		ctx.rest({
			tx : tx
		});
	},

	'POST /ETC' : async (ctx, next) => {
		let tx = createEtherTransaction(ctx.request.body);
		ctx.rest({
			tx : tx
		});
	},

	'POST /ERC20' : async (ctx, next) => {
		let tx = createErc20Transaction(ctx.request.body);
		ctx.rest({
			tx : tx
		});
	}
};