#!/bin/bash

# start namesrv

JAVA_HOME=`/usr/libexec/java_home -v 1.8`

export ROCKETMQ_HOME="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
echo "working dir is set to: $ROCKETMQ_HOME"
cd $ROCKETMQ_HOME

java -Xms1g -Xmx1g -Xmn512m -cp $ROCKETMQ_HOME/conf -Djava.ext.dirs=$JAVA_HOME/jre/lib/ext:$ROCKETMQ_HOME/lib -server -XX:MetaspaceSize=128m -XX:MaxMetaspaceSize=320m -XX:+UseConcMarkSweepGC -XX:+UseCMSCompactAtFullCollection -XX:CMSInitiatingOccupancyFraction=70 -XX:+CMSParallelRemarkEnabled -XX:SoftRefLRUPolicyMSPerMB=0 -XX:+CMSClassUnloadingEnabled -XX:SurvivorRatio=8 -XX:-UseParNewGC -XX:-OmitStackTraceInFastThrow -XX:-UseLargePages org.apache.rocketmq.namesrv.NamesrvStartup
