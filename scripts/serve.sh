#!/usr/bin/env bash
# Serve the explainers at http://127.0.0.1:8787/. Add --docker to also start the tier 2 lab services.
set -eu
cd "$(dirname "$0")/.."
[ -d runtime/vendor/pglite ] || scripts/vendor.sh
# The AWS lab's emulator (Floci) starts EC2, ECS and Lambda containers itself, outside compose. They carry the label floci=true.
floci_clean() {
  local ids
  ids=$(docker ps -aq --filter label=floci=true) && [ -n "$ids" ] && docker rm -f $ids >/dev/null 2>&1 || true
  ids=$(docker network ls -q --filter label=floci=true) && [ -n "$ids" ] && docker network rm $ids >/dev/null 2>&1 || true
  ids=$(docker volume ls -q --filter label=floci=true) && [ -n "$ids" ] && docker volume rm $ids >/dev/null 2>&1 || true
}
if [ "${1:-}" = --docker ]; then
  # CDN and TCP/TLS labs: a self-signed key and certificate for a made-up name, made on first run, never committed.
  [ -f lab/cdn/origin-key.pem ] && [ -f lab/cdn/origin-cert.pem ] || openssl req -x509 -newkey ec -pkeyopt ec_paramgen_curve:prime256v1 -nodes -days 36500 -subj /CN=origin.acmeshop.com -keyout lab/cdn/origin-key.pem -out lab/cdn/origin-cert.pem 2>/dev/null
  floci_clean
  docker compose -f lab/compose.yaml up -d --wait
  trap 'docker compose -f lab/compose.yaml down; floci_clean' EXIT
fi
node lab/server.mjs "${PORT:-8787}"
