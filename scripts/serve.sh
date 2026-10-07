#!/usr/bin/env bash
# Serve the explainers at http://127.0.0.1:8787/. Add --docker to also start the tier 2 lab services.
set -eu
cd "$(dirname "$0")/.."
[ -d runtime/vendor/pglite ] || scripts/vendor.sh
# The AWS lab's emulator (Floci) starts EC2, ECS and Lambda containers itself, outside compose. They carry the label floci=true.
floci_clean() {
  docker rm -f $(docker ps -aq --filter label=floci=true) >/dev/null 2>&1
  docker network rm $(docker network ls -q --filter label=floci=true) >/dev/null 2>&1
  docker volume rm $(docker volume ls -q --filter label=floci=true) >/dev/null 2>&1
  true
}
if [ "${1:-}" = --docker ]; then
  floci_clean
  docker compose -f lab/compose.yaml up -d --wait
  trap 'docker compose -f lab/compose.yaml down; floci_clean' EXIT
fi
node lab/server.mjs "${PORT:-8787}"
