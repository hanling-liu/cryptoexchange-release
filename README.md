# HighDAX CryptoExchange

The leading crypto currency exchange platform.

![DEMO](https://github.com/michaelliao/cryptoexchange-release/raw/master/highdax.png)

Features:

- Production-ready for AWS environment.
- RESTful APIs followed Swagger standard.
- Multi-currency and multi-symbol support.
- All professional order types including Stop, Stop-Limit, Trailing-Stop, FOK, IOC, Hidden, Post-Only, etc.
- High-speed in-memory match engine which can process 10K+ orders/s.
- Real-time clearing and 100% accurate.
- Real-time monitor and metrics everything.
- Real-time financial audit and detect any database compromise on time.
- HD wallet integration.
- Seperated hot-wallet and cold-wallet with high security.
- Build-in support for BTC, BCH, USDT, ETH, ETC, ERC20, etc.
- Integration with [Vault](https://www.vaultproject.io/) for safe storage of cold-wallet.
- Different maker / taker fee rates.
- Negative fee rate for maker.
- Can charge quote as fee for buyers.
- Custom extension for order pre-process and post-process.
- I18N support for English, Chinese, Japanese, Korean, etc.
- Management console support.

## Evaluate HighDAX Commercial Version

HighDAX commercial version can be run on localhost.

### OS

Support macOS / Linux. at least 16G memory.

### MySQL

MySQL is used for major storage of exchange.

Make sure MySQL was installed and version >= `5.7`.

Make sure MySQL is running in background and use default port `3306`.

### Redis

Redis is used for caching and pub/sub messaging.

Make sure Redis was installed and version >= `4.0`.

Make sure Redis is running in background and use default port `6379`.

```
$ redis-cli -v
redis-cli 4.x.x
```

### JDK

Most parts of crypto exchange are Java programs which require JVM.

Make sure JDK was installed and version >= `8`:

```
$ java -version
java version 1.8.x
```

NOTE: JDK 11 is also supported but RocketMQ require JDK 8. If you want to run crypto exchange on JDK 11, you need install both JDK 8 and JDK 11.

### Node.js

Node.js serves notifications which use WebSocket to push to browsers.

Make sure Node.js installed and version >= `8`:

```
$ node -v
v8.x.x
```

### Nginx

Nginx is used for reverse-proxy, and also serves HTTPS connections.

It is highly suggest install Nginx on development environment.

Install Nginx by [brew](https://brew.sh/) is recommended.

## Prepare

1. Create directories.

The following directories must be created by hand and set owner-writable:

- /data/rocketmq
- /var/log/crypto
- /var/log/nginx

You can change the owner of directory on OSX by command:

```
$ sudo chown <your-user-name>:staff <dirname>
```

2. Run MySQL initialize scripts.

Scripts to run sequentially:

- ex.sql
- ui.sql
- hd.sql
- mg.sql
- init-ex.sql
- init-ui.sql
- init-mg.sql

You can use the following command to run a SQL scripts:

```
mysql -u root -p < /path/to/ex.sql
```

3. Run RocketMQ and initialize topics.

  1. Run `start-namesrv.sh` to start RocketMQ name server.
  2. Run `start-mq.sh` to start RocketMQ server.
  3. Run `init-mq.sh` to create topics for exchange (only once).

Keep RocketMQ running and DO NOT close it.

4. Add Nginx configuration.

You MUST create a symbol link for Nginx configuration:

```
sudo mkdir -p /srv/cryptoexchange/build/
sudo ln -s /path/to/release/local /srv/cryptoexchange/build/local

# for macOS:
sudo ln -s /srv/cryptoexchange/build/local/nginx/highdax.conf /usr/local/etc/nginx/servers/highdax.conf

# for Debian/Ubuntu:
sudo ln -s /srv/cryptoexchange/build/local/nginx/highdax.conf /etc/nginx/sites-enabled/highdax.conf
```

Restart Nginx.

## Run

Switch currency directory to where `crypto-xxx.jar` exists and run each jar sequentially:

```
$ java -jar crypto-xxx.jar
```

Jars:

- crypto-config.jar
- crypto-api.jar
- crypto-quotation.jar
- crypto-sequence.jar
- crypto-spot-clearing.jar
- crypto-spot-match.jar
- crypto-ui.jar
- crypto-manage.jar

Switch currency directory to `snapshot/notification` and run:

```
$ npm install
$ node crypto-notification.js
```

`npm install` only require run once.

## Trade

### UI

URL: [https://www.local.highdax.com](https://www.local.highdax.com)

There are already initialized users: `bot0@example.com` ~ `bot999@example.com`, with password `password`.

### Management

URL: [https://manage.local.highdax.com](https://manage.local.highdax.com)

Root user: `root@example.com` with password `password`.

### API

URL: [https://api.local.highdax.com](https://api.local.highdax.com)

Sample API: [https://api.local.highdax.com/v1/market/trades](https://api.local.highdax.com/v1/market/trades)

## FAQ

Q: How can I generate lots of trade orders?

A: You can use `bot.py` to start trading automatically (about 10 orders per second).

Q: Where is the configuration files?

A: Configuration files are stored as `.yml` at `config-repo`. This is the standard of Spring Cloud Config.

Q: How can I change the configuration?

A: You can edit `.yml` files but this is not recommended. Instead you can pass environment variables like:

```
$ EXCHANGE_NAME=MyExchange java -jar crypto-ui.jar
```

All environment variables are set as `${EXCHANGE_NAME:HighDAX}` which has a default value.

Q: How can I add a production configuration files?

A: You don't need change any configuration files. Instead, you can pass environment variables using Supervisor (a daemon process management tool), and configuration file for Supervisor can be generated by Ansible, which is a standard release process on Linux.
