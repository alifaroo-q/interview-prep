#!/usr/bin/env bash
# Serve the explainers at http://127.0.0.1:8787/. Add --docker to also start the tier 2 lab services.
set -eu
cd "$(dirname "$0")/.."
[ -d runtime/vendor/pglite ] || scripts/vendor.sh
if [ "${1:-}" = --docker ]; then
  docker compose -f lab/compose.yaml up -d --wait
  trap 'docker compose -f lab/compose.yaml down' EXIT
fi
node lab/server.mjs "${PORT:-8787}"
