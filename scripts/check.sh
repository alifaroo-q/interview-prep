#!/usr/bin/env bash
# Static checks for every explainer. Usage: scripts/check.sh [file.html ...]
# Browser checks (clicking every lab) are still needed; see CLAUDE.md.
set -u
cd "$(dirname "$0")/.."
files=("$@"); [ ${#files[@]} -eq 0 ] && files=(explainers/*.html)
fail=0
for f in "${files[@]}"; do
  node -e '
    const fs=require("fs"),f=process.argv[1],h=fs.readFileSync(f,"utf8"),e=[];
    const js=(h.split("<script>")[1]||"").split("</script>")[0];
    try{new Function(js)}catch(x){e.push("JS syntax: "+x.message)}
    if(/\{\{[A-Z_]+\}\}/.test(h))e.push("template placeholder left: "+h.match(/\{\{[A-Z_]+\}\}/)[0]);
    const dashes=(h.match(/—/g)||[]).length; if(dashes)e.push(dashes+" em dash(es), use periods or commas");
    const secs=(h.match(/<section class="ch"/g)||[]).length, btns=(h.match(/class="done-btn"/g)||[]).length;
    if(secs!==btns)e.push(`${secs} chapters but ${btns} "Mark as read" buttons`);
    for(const id of new Set([...h.matchAll(/\$\(\x27#([\w-]+)\x27\)/g)].map(m=>m[1])))
      if(!h.includes(`id="${id}"`))e.push(`script uses #${id} but no element has that id`);
    console.log((e.length?"FAIL ":"ok   ")+f+(e.length?"\n  - "+e.join("\n  - "):""));
    process.exit(e.length?1:0);' "$f" || fail=1
done
exit $fail
