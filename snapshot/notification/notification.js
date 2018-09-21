'use strict';

/**
 * A websocket application that send notifications to clients.
 */

const Redis = require('ioredis');
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http, {
    path: '/v1/market',
    transports: ['websocket']
});

const
    TOPIC_PRICES = 'topic_prices',
    TOPIC_SNAPSHOT = 'topic_snapshot',
    TOPIC_TICK = 'topic_tick',
    TOPIC_BAR = 'topic_bar',
    HISTORY_BARS = 'history_bars',
    GET_HISTORY_BARS = 'get_history_bars',
    SUBSCRIBE = 'subscribe',
    UNSUBSCRIBE = 'unsubscribe',
    MAX_RECENT_TICKS = 20;

let redisOpts = {};
if (process.config.redis_password) {
	redisOpts['password'] = process.config.redis_password;
}

const redisPub = new Redis(process.config.redis_servers[0], redisOpts);
const redisCache = new Redis(process.config.redis_servers[0], redisOpts);

const
    SYMBOLS = new Set(process.config.symbols),
    TYPES = new Set(['K_1_MIN', 'K_1_HOUR', 'K_1_DAY']);

const
    recentSnapshots = new Map(),
    recentTicks = new Map();

for (let symbol of SYMBOLS) {
    recentSnapshots.set(symbol, null);
    recentTicks.set(symbol, []);
}

redisPub.subscribe([TOPIC_BAR, TOPIC_TICK, TOPIC_PRICES, TOPIC_SNAPSHOT], function (err, count) {
    console.log(`[REDIS] subscribed ${count} topic(s).`);
});

function initSymbolIfNotExist(symbol) {
    if (! SYMBOLS.has(symbol)){
        SYMBOLS.add(symbol);
        recentSnapshots.set(symbol, null);
        recentTicks.set(symbol, []);
    }
}

function broadcastBar(channel, message) {
    if (message && message.symbol) {
        initSymbolIfNotExist(message.symbol);
        io.to(message.symbol).emit(channel, message);
    } else {
        console.error('[INVALID] cannot emit bar message for message.symbol is missing.');
    }
}

function broadcastTick(channel, message) {
    if (message && message.symbol) {
        initSymbolIfNotExist(message.symbol);
        // cache in recent ticks:
        let ticks = recentTicks.get(message.symbol);
        ticks.unshift(message);
        if (ticks.length > MAX_RECENT_TICKS) {
            ticks.pop();
        }
        io.to(message.symbol).emit(channel, message);
    } else {
        console.error('[INVALID] cannot emit tick message for message.symbol is missing.');
    }
}

function broadcastSnapshot(channel, message) {
    if (message && message.symbol) {
        initSymbolIfNotExist(message.symbol);
        // compare last snapshot:
        let last = recentSnapshots.get(message.symbol);
        if(!last || (last && last.sequenceId < message.sequenceId)){
            recentSnapshots.set(message.symbol, message);
            io.to(message.symbol).emit(channel, message);
        }
    } else {
        console.error('[INVALID] cannot emit snapshot message for message.symbol is missing.');
    }
}

function broadcastPrices(channel, message) {
    io.emit(channel, message);
}

redisPub.on('message', function (channel, message) {
    console.log(`received from channel ${channel}: ${message}`);
    if (typeof(message) === 'string') {
        message = JSON.parse(message);
    }
    if (channel === TOPIC_BAR) {
        broadcastBar(channel, message);
    }
    else if (channel === TOPIC_TICK) {
        broadcastTick(channel, message);
    }
    else if (channel === TOPIC_SNAPSHOT) {
        broadcastSnapshot(channel, message);
    }
    else if (channel === TOPIC_PRICES) {
        broadcastPrices(channel, message);
    }
});

app.get('/heartbeat', function (req, res) {
    res.send('ok');
});

function cors(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,POST');
    next();
}

app.use(cors);

io.on('connection', function (socket) {
    console.log('[CONNECT] client connected.');
    // socket.
    socket.on(SUBSCRIBE, function (msg) {
        console.log('[SUBSCRIBE] client want to subscribe: ' + JSON.stringify(msg));
        if (msg && msg.symbol && SYMBOLS.has(msg.symbol) ) {
            console.log(`[SUBSCRIBE] will subscribe ${msg.symbol}...`);
            socket.join(msg.symbol);
            // send recent snapshot / ticks to newly subscriber:
            let snapshot = recentSnapshots.get(msg.symbol);
            if (snapshot) {
                socket.emit(TOPIC_SNAPSHOT, snapshot);
            }
            let ticks = recentTicks.get(msg.symbol);
            if (ticks.length !== 0) {
                socket.emit(TOPIC_TICK, ticks);
            }
        } else {
            console.warn('[SUBSCRIBE] cannot subscribe for symbol not found.');
            socket.emit(SUBSCRIBE, {
                error: 'PARAMETER_INVALID',
                message: 'no such symbol.'
            });
        }
    });
    socket.on(UNSUBSCRIBE, function (msg) {
        console.log('[UNSUBSCRIBE] client want to unsubscribe: ' + JSON.stringify(msg));
        if (msg && msg.symbol && SYMBOLS.has(msg.symbol)) {
            console.log(`[UNSUBSCRIBE] will unsubscribe ${msg.symbol}...`);
            socket.leave(msg.symbol);
        } else {
            console.warn('[UNSUBSCRIBE] cannot unsubscribe for symbol not found.');
        }
    });
    socket.on(GET_HISTORY_BARS, function (msg) {
        console.log('[BARS] client want to query history bars: ' + JSON.stringify(msg));
        if (msg && msg.symbol && msg.type && SYMBOLS.has(msg.symbol) && TYPES.has(msg.type)) {
            console.log(`[BARS] will query history bars of ${msg.symbol}, type: ${msg.type}...`);
            redisCache.zrangebyscore(msg.symbol +'_'+ msg.type, 0, Date.now()).then(function (data) {
                console.log(`[BARS] will send ${data.length} bars...`);
                socket.emit(HISTORY_BARS, '{"bars":[' + data.join(',') + ']}');
            });
        } else {
            console.warn('[BARS] cannot query history bars for symbol or type not found.');
            socket.emit(SUBSCRIBE, {
                error: 'PARAMETER_INVALID',
                message: 'no such symbol or type..'
            });
        }
    });
    socket.on('disconnect', function () {
        console.log('[DISCONNECT] client disconnected.');
    });
});

http.on('error', (e) => {
    if (e.code === 'EADDRINUSE') {
        console.error(e);
        console.error('***************************');
        console.error('APPLICATION FAILED TO START');
        console.error('***************************');
        process.exit(1);
    }
});

http.listen(process.config.serverPort, function () {
    console.log(`Express started on port(s): ${process.config.serverPort} (http)`);
});
