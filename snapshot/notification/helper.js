'use strict';

// helper functions

function getEnv(name, defaultValue) {
	let value = process.env[name];
	if (!value) {
		value = defaultValue;
	}
	return value;
}

function _replaceEnv(value) {
	let origin = value,
		startIndex = 0,
		result,
		re = /\$\{(\w+)\}/g;
	value = '';
	while ((result = re.exec(origin)) !== null) {
		//console.log(`found ${result[0]}, ${result[1]}, ${re.lastIndex}`);
		value = value + origin.substring(startIndex, re.lastIndex - result[0].length) + getEnv(result[1], '');
		//console.log(`${value}`);
		startIndex = re.lastIndex;
	}
	value = value + origin.substring(startIndex);
	return value;
}

function _replaceEnvWithDefault(value) {
	let origin = value,
		startIndex = 0,
		result,
		re = /\$\{(\w+)\:([^\}]+)\}/g;
	value = '';
	while ((result = re.exec(origin)) !== null) {
		value = value + origin.substring(startIndex, re.lastIndex - result[0].length) + getEnv(result[1], result[2]);
		startIndex = re.lastIndex;
	}
	value = value + origin.substring(startIndex);
	return value;
}

function getProperty(config, key) {
	let value = config.get(key);
	if (value) {
		if (typeof value === 'string') {
			value = _replaceEnv(value);
			value = _replaceEnvWithDefault(value);
		}
	}
	return value;
}

module.exports = {
	getEnv : getEnv,
	getProperty : getProperty
}