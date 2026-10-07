#!/bin/sh
# CDN lab setup, run by each lab's setup step. Safe to run many times.
# 1. Distance: toxiproxy adds 40 ms each way between edge and origin (80 ms round trip), and 500 ms each way on the slow port.
#    If the toxic is already there, toxiproxy answers 409 and changes nothing.
toxic() { curl -s -o /dev/null -X POST "toxiproxy:8474/proxies/$1/toxics" -d "{\"name\":\"far-$2\",\"type\":\"latency\",\"stream\":\"${2}stream\",\"attributes\":{\"latency\":$3}}"; }
for d in up down; do toxic cdn-origin $d 40; toxic cdn-origin-slow $d 500; done
# Turn the origin back on only if a lab cut it off, so a working setup is not touched.
curl -s toxiproxy:8474/proxies/cdn-origin | grep -q "\"enabled\":false" && curl -s -o /dev/null -X POST toxiproxy:8474/proxies/cdn-origin -d '{"enabled":true}'
# 2. Origin files back to version 1.
mkdir -p /origin-www/static
echo '<svg>logo v1</svg>' > /origin-www/static/logo.svg
echo 'console.log("app v1")' > /origin-www/static/app.js
# 3. Empty edge cache. nginx treats a missing cache file as a miss.
rm -rf /edge-cache/*
echo "setup done: origin 80 ms away, files at v1, edge cache empty"
