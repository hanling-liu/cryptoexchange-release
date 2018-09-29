#!/bin/bash

# start mqserver

JAVA_HOME=`/usr/libexec/java_home -v 1.8`

export ROCKETMQ_HOME="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
echo "working dir is set to: $ROCKETMQ_HOME"
cd $ROCKETMQ_HOME

export NAMESRV_ADDR=localhost:9876

java -Xms1g -Xmx1g -Xmn512m -cp $ROCKETMQ_HOME/conf -Djava.ext.dirs=$JAVA_HOME/jre/lib/ext:$ROCKETMQ_HOME/lib -server -XX:+UseG1GC -XX:G1HeapRegionSize=16m -XX:G1ReservePercent=25 -XX:InitiatingHeapOccupancyPercent=30 -XX:SoftRefLRUPolicyMSPerMB=0 -XX:SurvivorRatio=8 -XX:-OmitStackTraceInFastThrow -XX:+AlwaysPreTouch -XX:MaxDirectMemorySize=512m -XX:-UseLargePages -XX:-UseBiasedLocking org.apache.rocketmq.broker.BrokerStartup -c $ROCKETMQ_HOME/conf/broker.conf
