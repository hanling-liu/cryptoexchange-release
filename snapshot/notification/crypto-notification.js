'use strict';

// load config from spring-cloud-config server

const helper = require('./helper'),
	getEnv = helper.getEnv,
	getProperty = helper.getProperty,
	appName = 'notification',
	CONFIG_SERVER = getEnv('CONFIG_SERVER', 'http://localhost:8888'),
	PROFILES = getEnv('PROFILES', 'native'),
	request = require('request'),
	client = require('cloud-config-client');

function exit(message) {
	console.error(message);
	console.error('***************************');
	console.error('APPLICATION FAILED TO START');
	console.error('***************************');
	process.exit(1);
}

client.load({
	application : appName,
	endpoint : CONFIG_SERVER,
	profiles : [ PROFILES ],
	context : process.env
}).then(function(config) {
	var i,
		base,
		quote,
		symbols = [],
		redis_mode,
		redis_password,
		redis,
		redis_servers = [];
	let serverPort = getProperty(config, 'server.port'),
		apiEndpoint = getProperty(config, 'crypto.notification.api.endpoint');

	// call apiEndpoint:
	request(apiEndpoint + '/v1/market/trades', function(err, resp, body) {
		if (err) {
			exit(`[CONFIG] could not read from api end point ${apiEndpoint}: ${err}`);
		}
		if (resp.statusCode !== 200) {
			exit(`[CONFIG] bad status code ${resp.statusCode} when read from api end point ${apiEndpoint}.`);
		}
		let json = JSON.parse(body);
		json['symbols'].forEach(function(symbol) {
			symbols.push(symbol.baseName + '_' + symbol.quoteName);
		});
		console.log(`[CONFIG] successfully loaded symbols: ${JSON.stringify(symbols)}`);
		redis_mode = getProperty(config, 'crypto.redis.mode');
		redis_password = getProperty(config, 'crypto.redis.password');
		console.log(`[CONFIG] successfully loaded redis mode: ${redis_mode}`);

		for (i = 0;; i++) {
			redis = getProperty(config, `crypto.redis.nodes[${i}]`);
			if (redis) {
				redis_servers.push(redis);
			} else {
				break;
			}
		}
		console.log(`[CONFIG] successfully loaded redis servers: ${JSON.stringify(redis_servers)}`);

		process.config = {
			serverPort : serverPort,
			symbols : symbols,
			redis_mode : redis_mode,
			redis_password : redis_password,
			redis_servers : redis_servers
		};
		require('./notification.js');
	});

}).catch(function(err) {
	exit(`[CONFIG] error when load ${appName} (profile=${PROFILES}) from config server ${CONFIG_SERVER}:
${err}`);
});