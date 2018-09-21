'use strict';

const
	_ = require('lodash'),
	Koa = require('koa'),
	bodyParser = require('koa-bodyparser'),
	controller = require('./controller');

const PORT = 8007;

let app = new Koa();

app.use(bodyParser());
app.use(async (ctx, next) => {
	let request = ctx.request,
		response = ctx.response;
	console.log(`process ${request.method} ${request.url}...`);
	if (!process._initializing && request.path !== '/' && request.path !== '/initToken' && request.path !== '/initPassword') {
		response.status = 400;
		response.type = 'application/json';
		response.body = {
			error : 'wallet:not_ready',
			message : 'wallet is not initialized. please try later.'
		};
		return;
	}
	ctx.rest = (data) => {
		response.type = 'application/json';
		response.body = data;
	};
	try {
		await next();
	} catch (e) {
		console.warn('process API error.', e);
		response.status = 400;
		response.type = 'application/json';
		response.body = {
			error : e.error || 'internal:unknown_error',
			data : e.data || null,
			message : e.message || ''
		};
	}
});

app.use(controller());
app.listen(PORT);

console.log(`application started at port ${PORT}...`);
