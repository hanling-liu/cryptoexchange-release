#!/bin/bash

# init topics

JAVA_HOME=`/usr/libexec/java_home -v 1.8`

export ROCKETMQ_HOME="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
echo "working dir is set to: $ROCKETMQ_HOME"
cd $ROCKETMQ_HOME

export NAMESRV_ADDR=localhost:9876

INIT_CMD="java -Xms1g -Xmx1g -Xmn512m -cp $ROCKETMQ_HOME/conf -Djava.ext.dirs=$JAVA_HOME/jre/lib/ext:$ROCKETMQ_HOME/lib org.apache.rocketmq.tools.command.MQAdminStartup"

echo "init rocketmq topics..."

$INIT_CMD updateTopic -c DefaultCluster -n localhost:9876 -t q_order_to_seq -r 1 -w 1 -o true
$INIT_CMD updateTopic -c DefaultCluster -n localhost:9876 -t q_seq_to_match -r 1 -w 1 -o true
$INIT_CMD updateTopic -c DefaultCluster -n localhost:9876 -t q_match_to_clearing -r 10 -w 10 -o true
$INIT_CMD updateTopic -c DefaultCluster -n localhost:9876 -t q_clearing_to_account -r 10 -w 10 -o true
$INIT_CMD updateTopic -c DefaultCluster -n localhost:9876 -t q_match_quotation -r 1 -w 1 -o true
$INIT_CMD updateTopic -c DefaultCluster -n localhost:9876 -t q_post_order -r 10 -w 10 -o true

echo "ok."
