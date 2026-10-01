#!/usr/bin/env bash
# Static checks for every explainer, plus a real run of every tier 1 lab query. Usage: scripts/check.sh [file.html ...]
# Browser checks (clicking every lab) are still needed; see CLAUDE.md.
set -u
cd "$(dirname "$0")/.."
files=("$@"); [ ${#files[@]} -eq 0 ] && files=(explainers/*.html)
fail=0
node --check runtime/lab.js && node --check lab/server.mjs || fail=1
[ -d runtime/vendor/pglite ] || scripts/vendor.sh
for f in "${files[@]}"; do
  node -e '
    const fs=require("fs"),f=process.argv[1],h=fs.readFileSync(f,"utf8"),e=[];
    for(const [i,m] of [...h.matchAll(/<script>([\s\S]*?)<\/script>/g)].entries()){try{new Function(m[1])}catch(x){e.push(`JS syntax in inline script ${i+1}: `+x.message)}}
    if(/\{\{[A-Z_]+\}\}/.test(h))e.push("template placeholder left: "+h.match(/\{\{[A-Z_]+\}\}/)[0]);
    const dashes=(h.match(/—/g)||[]).length; if(dashes)e.push(dashes+" em dash(es), use periods or commas");
    const secs=(h.match(/<section class="ch"/g)||[]).length, btns=(h.match(/class="done-btn"/g)||[]).length;
    if(secs!==btns)e.push(`${secs} chapters but ${btns} "Mark as read" buttons`);
    for(const id of new Set([...h.matchAll(/\$\(\x27#([\w-]+)\x27\)/g)].map(m=>m[1])))
      if(!h.includes(`id="${id}"`))e.push(`script uses #${id} but no element has that id`);
    if(/class="lab (sql|term)"/.test(h)&&!h.includes("src=\"../runtime/lab.js\""))e.push("real labs present but ../runtime/lab.js is not loaded");
    const tools=[...fs.readFileSync("lab/server.mjs","utf8").matchAll(/^  (\w+): +\{ container:/gm)].map(m=>m[1]);
    for(const m of h.matchAll(/class="lab term" data-tool="([^"]*)"/g))if(!tools.includes(m[1]))e.push(`data-tool="${m[1]}" is not a lab server tool (${tools.join(", ")})`);
    console.log((e.length?"FAIL ":"ok   ")+f+(e.length?"\n  - "+e.join("\n  - "):""));
    process.exit(e.length?1:0);' "$f" || fail=1
  node scripts/check-labs.mjs "$f" || { echo "FAIL $f (real labs)"; fail=1; }
done
exit $fail
