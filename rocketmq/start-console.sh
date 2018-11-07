#!/bin/bash

# start mqserver

JAVA_HOME=`/usr/libexec/java_home -v 1.8`

export ROCKETMQ_HOME="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
echo "working dir is set to: $ROCKETMQ_HOME"
cd $ROCKETMQ_HOME

export NAMESRV_ADDR=localhost:9876

java -Xms1g -Xmx1g -Xmn512m -jar rocketmq-console-ng-1.0.0.jar
