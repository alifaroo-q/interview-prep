// Real-engine labs. Load once per page: <script type="module" src="../runtime/lab.js"></script>
// Tier 1 (browser): PostgreSQL via PGlite, SQLite via sql.js.  Tier 2 (lab server + Docker): the TOOLS in lab/server.mjs.
// Declarative markup is mounted automatically; custom labs import { db, session, run } from this file.

const VENDOR = new URL('./vendor/', import.meta.url);
const SERVED = location.protocol.startsWith('http');
const NEED_SERVER = 'Open this page through the lab server: run scripts/serve.sh, then open http://127.0.0.1:8787/';

/* ---------- tier 1: in-browser databases ---------- */

// Every engine returns the same Result shape: { cols: string[], rows: any[][], affected?: number, ms }.
// One query() may hold many statements; ms is the time for all of them and sits on the last result only.
const ENGINES = {
  async pg(ext) {
    const { PGlite } = await import(new URL('pglite/index.js', VENDOR));
    const extensions = {};
    for (const name of ext) extensions[name] = (await import(new URL(`pglite/contrib/${name}.js`, VENDOR)))[name];
    const pg = await PGlite.create({ extensions });
    for (const name of ext) await pg.exec(`CREATE EXTENSION IF NOT EXISTS ${name}`);
    return {
      async query(sql) {
        const t = performance.now(), out = await pg.exec(sql, { rowMode: 'array' }), ms = performance.now() - t;
        // PGlite's affectedRows is a running total across the statements of one exec.
        return out.map((r, i) => ({ cols: r.fields.map(f => f.name), rows: r.rows, affected: r.affectedRows - (out[i - 1]?.affectedRows ?? 0), ms: i === out.length - 1 ? ms : null }));
      },
      close: () => pg.close(),
    };
  },
  async sqlite() {
    if (!window.initSqlJs) await new Promise((ok, fail) => {
      const s = document.createElement('script'); s.src = new URL('sql.js/sql-wasm.js', VENDOR); s.onload = ok; s.onerror = fail; document.head.append(s);
    });
    const SQL = await initSqlJs({ locateFile: f => new URL('sql.js/' + f, VENDOR).href });
    const lite = new SQL.Database();
    return {
      async query(sql) {
        const t = performance.now(), out = lite.exec(sql), ms = performance.now() - t;
        return out.length ? out.map((r, i) => ({ cols: r.columns, rows: r.values, ms: i === out.length - 1 ? ms : null })) : [{ cols: [], rows: [], affected: lite.getRowsModified(), ms }];
      },
      close: () => lite.close(),
    };
  },
};

// A database is declared once per page: <template data-db="shop" data-engine="pg" data-ext="pageinspect">setup SQL</template>
const dbs = new Map();
export function db(name) {
  if (!dbs.has(name)) dbs.set(name, (async () => {
    if (!SERVED) throw new Error(NEED_SERVER);
    const decl = document.querySelector(`template[data-db="${name}"]`);
    if (!decl) throw new Error(`no <template data-db="${name}"> on this page`);
    const ext = (decl.dataset.ext || '').split(',').map(s => s.trim()).filter(Boolean);
    const conn = await ENGINES[decl.dataset.engine || 'pg'](ext);
    if (decl.content.textContent.trim()) await conn.query(decl.content.textContent);
    return conn;
  })());
  return dbs.get(name);
}

export async function resetDb(name) {
  const old = dbs.get(name); dbs.delete(name);
  if (old) (await old.catch(() => null))?.close();
  document.dispatchEvent(new CustomEvent('lab:reset', { detail: name }));
  return db(name);
}

/* ---------- tier 2: lab server ---------- */

async function api(path, body) {
  if (!SERVED) throw new Error(NEED_SERVER);
  const r = await fetch('/api/' + path, body && { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })
    .catch(() => { throw new Error('Lab server is not running. Run: scripts/serve.sh --docker'); });
  const j = await r.json();
  if (!r.ok) throw new Error(j.error);
  return j;
}

export const health = () => api('health');
export const run = (tool, args) => api('run', { tool, args });

// A long-lived tool process (one psql connection, one redis-cli). send() resolves when the input finished;
// onOut gets output as it arrives, and onWait(true) fires while the input is still running (e.g. blocked on a lock).
export async function session(tool) {
  const { id } = await api('session', { tool });
  let queue = Promise.resolve();
  const s = {
    send(input, onOut = () => {}, onWait = () => {}) {
      return queue = queue.then(async () => {
        // A short first wait, so a blocked input shows as waiting quickly.
        let r = await api('session/' + id, { input, wait: 300 });
        while (true) {
          if (r.out) onOut(r.out);
          if (r.done) break;
          onWait(true);
          r = await api('session/' + id, {});
        }
        onWait(false);
      });
    },
    close: () => api('session/' + id, { close: true }).catch(() => {}),
  };
  addEventListener('pagehide', s.close);
  return s;
}

/* ---------- rendering ---------- */

const esc = v => String(v).replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);
const cell = v => v === null ? '<i class="xp-null">NULL</i>' : esc(v instanceof Uint8Array ? '\\x' + [...v].map(b => b.toString(16).padStart(2, '0')).join('') : typeof v === 'object' ? JSON.stringify(v) : v);

export function renderResult(r) {
  const ms = r.ms == null ? '' : ` · ${r.ms.toFixed(1)} ms (whole run)`;
  if (r.cols.length === 1 && r.cols[0] === 'QUERY PLAN') return `<pre class="xp-plan">${esc(r.rows.map(x => x[0]).join('\n'))}</pre>`;
  if (!r.cols.length) return `<div class="xp-tag">${r.affected ?? 0} row(s) affected${ms}</div>`;
  return `<div class="xp-tw"><table class="xp-t"><tr>${r.cols.map(c => `<th>${esc(c)}</th>`).join('')}</tr>` +
    r.rows.map(row => `<tr>${row.map(v => `<td>${cell(v)}</td>`).join('')}</tr>`).join('') +
    `</table></div><div class="xp-tag">${r.rows.length} row(s)${ms}</div>`;
}

const css = `
.xp-ed{width:100%;min-height:84px;font:13px/1.5 ui-monospace,Consolas,monospace;color:var(--text);background:var(--bg);border:1px solid var(--line);border-radius:8px;padding:8px 10px;resize:vertical}
.xp-out{background:var(--bg);border:1px solid var(--line);border-radius:8px;padding:8px 10px;max-height:360px;overflow:auto;margin-top:8px;font-size:13px}
.xp-out:empty{display:none}
.xp-q{font:12.5px/1.45 ui-monospace,Consolas,monospace;color:var(--edge);white-space:pre-wrap;margin-top:8px}
.xp-q:first-child{margin-top:0}
.xp-err{color:var(--bad);font:12.5px ui-monospace,Consolas,monospace;white-space:pre-wrap}
.xp-tag{color:var(--mute);font-size:12px;margin:2px 0 6px}
.xp-tw{overflow:auto}
.xp-t{border-collapse:collapse;margin:4px 0;font:12.5px ui-monospace,Consolas,monospace;width:auto}
.xp-t th,.xp-t td{border:1px solid var(--line);padding:2px 8px;white-space:nowrap}
.xp-null{color:var(--mute)}
.xp-plan{margin:4px 0;font-size:12.5px}
.xp-st{font-size:12.5px;color:var(--mute)}.xp-st.bad{color:var(--bad)}.xp-st.warn{color:var(--warn)}.xp-st.ok{color:var(--ok)}
.xp-panes{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px}
.xp-pane h5{margin:0 0 6px;font-size:13px;display:flex;gap:8px;align-items:center}
.xp-term{font:12.5px/1.45 ui-monospace,Consolas,monospace;white-space:pre-wrap;color:var(--text)}
.xp-term .xp-q{margin-top:6px}
`;

function status(el, text, cls = '') { el.className = 'xp-st ' + cls; el.textContent = text; }
function presets(root, onPick, pane) {
  const bar = document.createElement('div'); bar.className = 'bar';
  root.querySelectorAll(`:scope > template[data-label]${pane ? `[data-pane="${pane}"]` : ''}`).forEach(t => {
    const b = document.createElement('button'); b.textContent = t.dataset.label; b.onclick = () => onPick(t.content.textContent.trim()); bar.append(b);
  });
  return bar.childElementCount ? bar : null;
}
function editor(text, onRun) {
  const ed = document.createElement('textarea'); ed.className = 'xp-ed'; ed.name = 'input'; ed.setAttribute('aria-label', 'Input'); ed.spellcheck = false; ed.value = text;
  ed.addEventListener('keydown', e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); onRun(); } });
  return ed;
}
// Run the selected text if there is a selection, else everything.
const picked = ed => ed.selectionStart !== ed.selectionEnd ? ed.value.slice(ed.selectionStart, ed.selectionEnd) : ed.value;

// <div class="lab sql" data-db="shop"> <textarea>first query</textarea> <template data-label="Preset">SQL</template> </div>
function mountSql(root) {
  const name = root.dataset.db, first = root.querySelector(':scope > textarea');
  const ed = editor(first ? first.value.trim() : '', () => go());
  first?.remove();
  const ctl = document.createElement('div'); ctl.className = 'bar';
  ctl.innerHTML = '<button class="pri">Run ▶</button><button>Clear output</button><button class="dan">Reset database</button><span class="xp-st"></span>';
  const [runB, clrB, rstB, st] = ctl.children, out = document.createElement('div'); out.className = 'xp-out';
  const pre = presets(root, sql => { ed.value = sql; go(); });
  root.append(...[pre, ed, ctl, out].filter(Boolean));

  const engine = document.querySelector(`template[data-db="${name}"]`)?.dataset.engine === 'sqlite' ? 'SQLite' : 'PostgreSQL';
  const boot = () => { status(st, `Starting ${engine} in your browser…`, 'warn'); return db(name).then(c => (status(st, `${engine} ready`, 'ok'), c), e => { status(st, e.message, 'bad'); throw e; }); };
  async function go() {
    const sql = picked(ed).trim(); if (!sql) return;
    runB.disabled = true;
    try {
      const conn = await (dbs.has(name) ? db(name) : boot());
      const q = document.createElement('div'); q.className = 'xp-q'; q.textContent = sql; out.append(q);
      const res = document.createElement('div'); out.append(res);
      try { res.innerHTML = (await conn.query(sql)).map(renderResult).join(''); status(st, `${engine} ready`, 'ok'); }
      catch (e) { res.innerHTML = `<div class="xp-err">ERROR${e.code ? ' ' + e.code : ''}: ${esc(e.message)}</div>`; }
      out.scrollTop = out.scrollHeight;
    } catch {} finally { runB.disabled = false; }
  }
  runB.onclick = go;
  clrB.onclick = () => out.replaceChildren();
  rstB.onclick = async () => { await resetDb(name).catch(() => {}); };
  document.addEventListener('lab:reset', e => { if (e.detail === name) { out.replaceChildren(); boot().catch(() => {}); } });
  // Start the engine when the lab scrolls near view, so the first Run is fast.
  new IntersectionObserver((es, o) => { if (es[0].isIntersecting) { o.disconnect(); if (!dbs.has(name)) boot().catch(() => {}); } }, { rootMargin: '400px' }).observe(root);
}

// <div class="lab term" data-tool="psql" data-panes="2"> <template class="setup">SQL run once in pane 1</template>
//   <template data-pane="1" data-label="BEGIN">…</template> </div>
function mountTerm(root) {
  const tool = root.dataset.tool, n = +(root.dataset.panes || 1);
  const setup = root.querySelector(':scope > template.setup')?.content.textContent.trim();
  let info = { session: true, prompt: '> ' };
  const grid = document.createElement('div'); grid.className = 'xp-panes';
  const head = document.createElement('div'); head.className = 'bar';
  head.innerHTML = '<button>Reconnect all</button><span class="xp-st"></span>';
  const st = head.lastChild;
  root.append(head, grid);
  let panes = [];

  function pane(i) {
    const el = document.createElement('div'); el.className = 'xp-pane';
    el.innerHTML = `<h5>${n > 1 ? `Session ${i}` : tool} <span class="xp-st"></span></h5>`;
    const pst = el.querySelector('.xp-st'), out = document.createElement('div'); out.className = 'xp-out xp-term';
    const ed = editor('', () => go()); ed.style.minHeight = '60px';
    const runB = document.createElement('button'); runB.className = 'pri'; runB.textContent = 'Send ▶';
    const pre = presets(root, text => { ed.value = text; go(); }, n > 1 ? String(i) : null);
    el.append(...[pre, ed, runB, out].filter(Boolean));
    const p = { el, conn: null };
    const write = (text, cls) => { const d = document.createElement('div'); if (cls) d.className = cls; d.textContent = text; out.append(d); out.scrollTop = out.scrollHeight; };
    async function go() {
      const text = picked(ed).trim(); if (!text) return;
      write(info.prompt + text, 'xp-q');
      try {
        if (!info.session) { const r = await run(tool, text.split(/\s+/)); write(r.out); return; }
        p.conn ??= await session(tool);
        await p.conn.send(text, s => write(s), w => status(pst, w ? 'waiting… (still running, maybe blocked)' : '', w ? 'warn' : ''));
      } catch (e) { write(e.message, 'xp-err'); }
    }
    runB.onclick = go;
    p.write = write;
    return p;
  }

  async function connect() {
    panes.forEach(p => p.conn?.close());
    grid.replaceChildren(); panes = [];
    for (let i = 1; i <= n; i++) { const p = pane(i); panes.push(p); grid.append(p.el); }
    try {
      info = (await health())[tool];
      if (!info) return status(st, `unknown tool "${tool}"`, 'bad');
      if (!info.up) return status(st, `${tool} is not running. Run: scripts/serve.sh --docker`, 'bad');
      status(st, `Connected to real ${tool} in Docker`, 'ok');
      if (setup && info.session) { panes[0].conn = await session(tool); await panes[0].conn.send(setup, () => {}); panes[0].write('(setup done)', 'xp-tag'); }
    } catch (e) { status(st, e.message, 'bad'); }
  }
  head.firstChild.onclick = connect;
  connect();
}

document.head.insertAdjacentHTML('beforeend', `<style>${css}</style>`);
document.querySelectorAll('.lab.sql[data-db]').forEach(mountSql);
document.querySelectorAll('.lab.term[data-tool]').forEach(mountTerm);
