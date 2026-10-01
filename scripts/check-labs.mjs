// Runs every tier 1 real lab of an explainer on the real engine, in Node: setup SQL, then each console's
// first query and presets in page order. A preset that should fail carries data-expect-error.
// Usage: node scripts/check-labs.mjs file.html   Exit code 1 on any failure.
import fs from 'node:fs';
import { createRequire } from 'node:module';

const VENDOR = new URL('../runtime/vendor/', import.meta.url);
const html = fs.readFileSync(process.argv[2], 'utf8');
const decode = s => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
const attr = (tag, name) => tag.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1];

const decls = new Map();
for (const m of html.matchAll(/(<template\b[^>]*\bdata-db="[^"]*"[^>]*>)([\s\S]*?)<\/template>/g))
  decls.set(attr(m[1], 'data-db'), { engine: attr(m[1], 'data-engine') || 'pg', ext: (attr(m[1], 'data-ext') || '').split(',').map(s => s.trim()).filter(Boolean), setup: decode(m[2]) });

// A console's body runs from its opening tag to the next lab or chapter boundary.
const consoles = [];
for (const m of html.matchAll(/<div class="lab sql"[^>]*>/g)) {
  const rest = html.slice(m.index + m[0].length), end = rest.search(/<div class="lab\b|<\/section>/);
  const body = end < 0 ? rest : rest.slice(0, end);
  const steps = [];
  for (const s of body.matchAll(/<textarea[^>]*>([\s\S]*?)<\/textarea>|(<template\b[^>]*\bdata-label="[^"]*"[^>]*>)([\s\S]*?)<\/template>/g))
    steps.push(s[1] !== undefined ? { label: 'first query', sql: decode(s[1]), expectError: false } : { label: attr(s[2], 'data-label'), sql: decode(s[3]), expectError: /\bdata-expect-error\b/.test(s[2]) });
  consoles.push({ db: attr(m[0], 'data-db'), steps });
}

async function open({ engine, ext }) {
  if (engine === 'sqlite') {
    const SQL = await createRequire(import.meta.url)(new URL('sql.js/sql-wasm.js', VENDOR).pathname)();
    const lite = new SQL.Database();
    return { query: async sql => lite.exec(sql) };
  }
  const { PGlite } = await import(new URL('pglite/index.js', VENDOR));
  const extensions = {};
  for (const n of ext) extensions[n] = (await import(new URL(`pglite/contrib/${n}.js`, VENDOR)))[n];
  const pg = await PGlite.create({ extensions });
  for (const n of ext) await pg.exec(`CREATE EXTENSION IF NOT EXISTS ${n}`);
  return { query: sql => pg.exec(sql) };
}

const errors = [], conns = new Map();
for (const c of consoles) {
  const d = decls.get(c.db);
  if (!d) { errors.push(`console uses data-db="${c.db}" but no <template data-db="${c.db}"> exists`); continue; }
  if (!conns.has(c.db)) {
    const conn = await open(d);
    try { if (d.setup.trim()) await conn.query(d.setup); } catch (e) { errors.push(`db "${c.db}" setup: ${e.message}`); }
    conns.set(c.db, conn);
  }
  for (const s of c.steps) {
    let err = null;
    try { await conns.get(c.db).query(s.sql); } catch (e) { err = e.message; }
    if (err && !s.expectError) errors.push(`db "${c.db}", "${s.label}": ${err}`);
    if (!err && s.expectError) errors.push(`db "${c.db}", "${s.label}": expected an error but it succeeded`);
  }
}
const steps = consoles.reduce((n, c) => n + c.steps.length, 0);
if (errors.length) { console.log('  - ' + errors.join('\n  - ')); process.exit(1); }
if (consoles.length) console.log(`  real labs: ${consoles.length} consoles, ${steps} queries ran clean`);
