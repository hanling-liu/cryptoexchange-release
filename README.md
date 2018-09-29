# CryptoExchange

The leading crypto currency exchange platform.

## Environment

### OS

Support macOS / Linux. 16G memory.

### MySQL

MySQL is used for major storage of exchange.

Make sure MySQL was installed and version >= 5.7.

Make sure MySQL is running in background and use default port (3306).

### Redis

Redis is used for caching and pub/sub messaging.

Make sure Redis was installed and version >= 4.0.

Make sure Redis is running in background and use default port (6379).

### JDK

Most parts of crypto exchange are Java programs which require JVM.

Make sure JDK was installed and version >= 8:

```
$ java -version
java version 1.8.x
```

NOTE: JDK 11 is also supported but RocketMQ require JDK 8. If you want to run crypto exchange on JDK 11, you need install both JDK 8 and JDK 11.

### Node.js

Node.js serves notifications which use WebSocket to push to browsers.

Make sure Node.js installed and version >= 8:

```
$ node -v
v8.x.x
```

### Nginx

Nginx is used for reverse-proxy, and also serves HTTPS connections.

Install Nginx by brew is recommended.

## Prepare

1. Create directories.

The following directories must be created by hand and set owner-writable:

- /data/rocketmq
- /var/log/crypto
- /var/log/nginx

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
  3. Run `init-mq.sh` to create topics for exchange.

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

## Trade

### UI

URL: [https://www.highdax.com](https://www.highdax.com)

There are already initialized users: `bot0@example.com` ~ `bot999@example.com`, with password `password`.

### Management

URL: [https://manage.highdax.com](https://manage.highdax.com)

Root user: `root@example.com` with password `password`.

### API

URL: [https://api.highdax.com](https://api.highdax.com)

Sample API: [https://api.highdax.com/v1/market/trades](https://api.highdax.com/v1/market/trades)

## FAQ

Q: Where is the configuration files?

A: Configuration files are stored as `.yml` at `config-repo`. This is the standard of Spring Cloud Config.

Q: How can I change the configuration?

A: You can edit `.yml` files but this is not recommended. Instead you can pass environment variables like:

```
$ EXCHANGE_NAME=MyExchange java -jar crypto-ui.jar
```

All environment variables are set as `${EXCHANGE_NAME:HighDAX}` which has a default value.
