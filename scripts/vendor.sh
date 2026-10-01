#!/usr/bin/env bash
# Fetch the WASM engines into runtime/vendor/ (git-ignored). Run once; after that, labs work offline.
set -eu
cd "$(dirname "$0")/.."
PGLITE=0.5.8 SQLJS=1.14.2
out=runtime/vendor tmp=$(mktemp -d); trap 'rm -rf "$tmp"' EXIT
rm -rf "$out"; mkdir -p "$out/pglite" "$out/sql.js"
(cd "$tmp" && npm pack --silent "@electric-sql/pglite@$PGLITE" "sql.js@$SQLJS" >/dev/null)
tar xzf "$tmp"/electric-sql-pglite-*.tgz -C "$tmp" && mv "$tmp/package" "$tmp/pg"
tar xzf "$tmp"/sql.js-*.tgz -C "$tmp"
(cd "$tmp/pg/dist" && find . -type f ! -name '*.map' ! -name '*.cjs' ! -name '*.d.ts' ! -name '*.d.cts' -exec cp --parents {} "$OLDPWD/$out/pglite/" \;)
cp "$tmp"/package/dist/sql-wasm.{js,wasm} "$out/sql.js/"
echo "pglite $PGLITE, sql.js $SQLJS -> $out ($(du -sh "$out" | cut -f1))"
