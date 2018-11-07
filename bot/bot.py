#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os, sys, json, time, random, threading

from urllib import request, parse

# set base dir:
basedir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
print('base dir is set to: %s' % basedir)
sys.path.append(os.path.join(basedir, 'build', 'sdk'))

from sdk import ApiClient

API_HOST = 'api.local.highdax.com'

SYMBOLS_MAPPING = {
    'BTC_USDT': '1',
    'ETH_USDT': '1027'
}

SLEEP = 0.2

def main():
    num = 1
    host = API_HOST
    https = True
    symbol = 'BTC_USDT'
    for arg in sys.argv:
        if arg.startswith('-host='):
            host = arg[6:]
        if arg.startswith('-https='):
            https = arg[7:].lower() == 'true'
        if arg.startswith('-num='):
            num = int(arg[5:])
        if arg.startswith('-symbol='):
            symbol = arg[8:]
    remoteSymbol = SYMBOLS_MAPPING.get(symbol)
    if remoteSymbol is None:
        print('ERROR: invalid symbol: %s' % symbol)
        exit(1)
    keys = load_keys(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'init-keys.json'))
    startIndex = int(random.random() * 20)
    for i in range(num):
        kp = keys[i + startIndex]
        t = threading.Thread(target=lambda: do_jobs(kp['apiKey'], kp['apiSecret'], host, https, symbol, remoteSymbol))
        t.start()

def load_keys(filename):
    with open(filename, 'r') as fp:
        return json.load(fp)

def do_jobs(key, secret, host, https, symbol, remoteSymbol):
    print('start bot for %s, key = %s, secret = %s******...' % (symbol, key, secret[0:6]))
    client = ApiClient(key, secret, host, https)
    while True:
        try:
            world_price = get_world_price(remoteSymbol)
            print('world price: %s' % world_price)
            exist_orders = cancel_order(client, symbol)
            if exist_orders < 20:
                if random.random() < 0.5:
                    place_limit_buy_order(client, symbol, world_price)
                    place_limit_sell_order(client, symbol, world_price)
                else:
                    place_limit_sell_order(client, symbol, world_price)
                    place_limit_buy_order(client, symbol, world_price)
            place_market_order(client, symbol, world_price)
        except Exception as e:
            print(e)
        time.sleep(random.random() * SLEEP)

def cancellable_order(o):
    if o.type == 'BUY_LIMIT' or o.type == 'SELL_LIMIT':
        if o.status == 'SEQUENCED' or o.status == 'PARTIAL_FILLED':
            return True
    return False

def cancel_order(client, symbol):
    print('get orders...')
    r = client.get('/v1/trade/orders', symbol=symbol)
    if success(r):
        orders = list(filter(cancellable_order, r.orders))
        print('%s orders can be cancelled.' % len(orders))
        if len(orders) > 18:
            targetOrder = orders[-1]
            print('cancel order %s %s' % (targetOrder.type, targetOrder.id))
            r = client.post('/v1/trade/orders/%s/cancel' % targetOrder.id)
            print('cancelled ok? %s' % error(r))
        return len(orders) - 1
    return 0

def success(result):
    return not hasattr(result, 'error')

def error(result):
    if hasattr(result, 'error'):
        return 'ERROR %s: %s' % (result.error, result.message)
    return 'OK'

def place_market_order(client, symbol, world_price):
    price = world_price / 1000 + random.random() * world_price / 1000
    amount = random.random() * 0.02 + 0.01
    r = client.post('/v1/trade/orders', {
        'symbol': symbol,
        'type': 'SELL_MARKET',
        'amount': amount
    })
    r = client.post('/v1/trade/orders', {
        'symbol': symbol,
        'type': 'BUY_MARKET',
        'price': price
    })

def place_limit_buy_order(client, symbol, world_price):
    price = world_price
    delta = price / 2000.0
    for i in range(3):
        price = price - random.random() * delta
        amount = random.random() * 0.2 + 0.01
        r = client.post('/v1/trade/orders', {
            'symbol': symbol,
            'type': 'BUY_LIMIT',
            'price': price,
            'amount': amount
        })
        print('place BUY_LIMIT at %s ok? %s' % (price, error(r)))
        time.sleep(random.random() * SLEEP)

def place_limit_sell_order(client, symbol, world_price):
    price = world_price
    delta = price / 2000.0
    for i in range(3):
        price = price + random.random() * delta
        amount = random.random() * 0.2 + 0.01
        r = client.post('/v1/trade/orders', {
            'symbol': symbol,
            'type': 'SELL_LIMIT',
            'price': price,
            'amount': amount
        })
        print('place SELL_LIMIT at %s ok? %s' % (price, error(r)))
        time.sleep(random.random() * SLEEP)

# keep as (price, timestamp):
WORLD_PRICE = (None, 0)

def get_world_price(remoteSymbol):
    '''
    get world price, cache at least 5 seconds.
    '''
    global WORLD_PRICE
    p = WORLD_PRICE
    if p[1] > time.time():
        return p[0]
    # update price:
    url = 'https://api.coinmarketcap.com/v2/ticker/%s/' % remoteSymbol;
    req = request.Request(url)
    with request.urlopen(req, timeout=5) as f:
        s = f.read()
        r = json.loads(s.decode('utf-8'))
        p = (r['data']['quotes']['USD']['price'], time.time() + 5)
        print('got price: %s' % p[0])
    WORLD_PRICE = p
    return p[0]

if __name__ == '__main__':
    main()
