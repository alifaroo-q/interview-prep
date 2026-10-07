#!/bin/sh
# TCP/TLS lab setup, run by each lab's setup step. Safe to run many times.
# Usage: net-setup [rtt_ms] [loss_percent]. Default: 100 ms, no loss.
# tc netem delays (and drops) every packet this container sends, so the round trip to any other lab container is about rtt_ms.
rtt=${1:-100} loss=${2:-0}
tc qdisc replace dev eth0 root netem delay "${rtt}ms" loss "${loss}%"
echo "setup done: round trip about $rtt ms, $loss% of packets this client sends are lost"
