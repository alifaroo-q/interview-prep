// Lab server: serves the repo over HTTP (needed for WASM engines) and runs real tools in Docker for tier 2 labs.
// Usage: node lab/server.mjs [port]   Only binds 127.0.0.1.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn, execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';

const ROOT = path.resolve(import.meta.dirname, '..');
const PORT = +(process.argv[2] || 8787);
const END = '__XP_END__';

// Commands get an empty stdin, so a program that reads stdin cannot swallow the session's next input.
const shellInput = s => `{ ${s}\n} </dev/null`;

// session tools keep one process per lab pane; `end` makes the tool print END after each input.
const TOOLS = {
  psql:  { container: 'xp-pg', session: true, prompt: 'lab=# ', cmd: ['sh', '-c', 'psql -U postgres -d lab -X -v ON_ERROR_STOP=0 2>&1'], end: `\\echo ${END}` },
  redis: { container: 'xp-redis', session: true, prompt: '> ', cmd: ['sh', '-c', 'redis-cli --no-raw 2>&1'], end: `ECHO ${END}` },
  sh:    { container: 'xp-tools', session: true, prompt: '$ ', cmd: ['sh', '-c', 'exec sh 2>&1'], end: `echo ${END}`, wrap: shellInput },
  kafka: { container: 'xp-kafka', session: true, prompt: '$ ', cmd: ['sh', '-c', 'cd /opt/kafka/bin && PATH=$PATH:/opt/kafka/bin exec sh 2>&1'], end: `echo ${END}`, wrap: shellInput },
  dig:   { container: 'xp-tools', prompt: '$ dig ', cmd: ['dig'] },
  curl:  { container: 'xp-tools', prompt: '$ curl ', cmd: ['curl', '-sS', '--max-time', '10'] },
};

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.wasm': 'application/wasm',
  '.css': 'text/css', '.json': 'application/json', '.data': 'application/octet-stream', '.gz': 'application/gzip', '.svg': 'image/svg+xml', '.png': 'image/png' };

const sessions = new Map();

function running() {
  try { return new Set(execFileSync('docker', ['ps', '--format', '{{.Names}}'], { encoding: 'utf8' }).split('\n')); }
  catch { return new Set(); }
}

function openSession(tool) {
  const t = TOOLS[tool];
  const p = spawn('docker', ['exec', '-i', t.container, ...t.cmd]);
  const s = { id: randomUUID(), tool: t, p, buf: '', waiters: [], closed: false };
  const feed = d => { s.buf += d; s.waiters.splice(0).forEach(w => w()); };
  p.stdout.on('data', feed); p.stderr.on('data', feed);
  p.on('close', () => { s.closed = true; feed(''); });
  sessions.set(s.id, s);
  return s;
}

// Wait until the tool printed END (input finished) or `ms` passed (input still running, e.g. blocked on a lock).
async function drain(s, ms) {
  const deadline = Date.now() + ms;
  while (!s.buf.includes(END) && !s.closed && Date.now() < deadline)
    await new Promise(r => { s.waiters.push(r); setTimeout(r, deadline - Date.now()); });
  // redis-cli --no-raw prints the marker in quotes.
  const m = s.buf.match(new RegExp(`"?${END}"?\\r?\\n?`));
  const done = !!m || s.closed;
  const out = m ? s.buf.slice(0, m.index) : s.buf;
  s.buf = m ? s.buf.slice(m.index + m[0].length) : '';
  return { out, done, closed: s.closed };
}

function runOnce(tool, args) {
  const t = TOOLS[tool];
  return new Promise(res => {
    const p = spawn('docker', ['exec', t.container, ...t.cmd, ...args]);
    let out = ''; p.stdout.on('data', d => out += d); p.stderr.on('data', d => out += d);
    p.on('close', code => res({ out, code }));
  });
}

const body = req => new Promise(r => { let b = ''; req.on('data', d => b += d); req.on('end', () => { try { r(JSON.parse(b || '{}')); } catch { r({}); } }); });
const json = (res, code, obj) => { res.writeHead(code, { 'content-type': 'application/json' }); res.end(JSON.stringify(obj)); };

async function api(req, res, url) {
  // Only pages served by this server may call the API (blocks other sites and DNS rebinding).
  const host = req.headers.host, origin = req.headers.origin;
  if (!/^(127\.0\.0\.1|localhost):\d+$/.test(host || '') || (origin && origin !== `http://${host}`)) return json(res, 403, { error: 'forbidden' });
  const [, , what, id] = url.pathname.split('/');
  if (what === 'health') {
    const up = running();
    return json(res, 200, Object.fromEntries(Object.entries(TOOLS).map(([k, t]) => [k, { up: up.has(t.container), session: !!t.session, prompt: t.prompt }])));
  }
  if (req.method !== 'POST') return json(res, 405, { error: 'POST only' });
  const b = await body(req);
  if (what === 'run') {
    const t = TOOLS[b.tool];
    if (!t || t.session || !Array.isArray(b.args) || !b.args.every(a => typeof a === 'string')) return json(res, 400, { error: 'bad tool or args' });
    return json(res, 200, await runOnce(b.tool, b.args));
  }
  if (what === 'session' && !id) {
    if (!TOOLS[b.tool]?.session) return json(res, 400, { error: 'not a session tool' });
    if (!running().has(TOOLS[b.tool].container)) return json(res, 503, { error: `container ${TOOLS[b.tool].container} is not running. Run: scripts/serve.sh --docker` });
    return json(res, 200, { id: openSession(b.tool).id });
  }
  const s = sessions.get(id);
  if (!s) return json(res, 404, { error: 'no such session' });
  if (b.close) { s.p.kill(); sessions.delete(id); return json(res, 200, { closed: true }); }
  if (typeof b.input === 'string') s.p.stdin.write((s.tool.wrap ?? (x => x))(b.input.replace(/\s*$/, '')) + '\n' + s.tool.end + '\n');
  return json(res, 200, await drain(s, b.wait ?? 1500));
}

http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  if (url.pathname.startsWith('/api/')) return api(req, res, url).catch(e => json(res, 500, { error: String(e) }));
  if (url.pathname === '/favicon.ico') { res.writeHead(204); return res.end(); }
  if (url.pathname === '/') {
    res.writeHead(200, { 'content-type': TYPES['.html'] });
    return res.end('<h1>Explainers</h1>' + fs.readdirSync(path.join(ROOT, 'explainers')).filter(n => n.endsWith('.html')).map(n => `<p><a href="/explainers/${n}">${n}</a></p>`).join(''));
  }
  const f = path.join(ROOT, decodeURIComponent(url.pathname));
  if (!f.startsWith(ROOT + path.sep)) return json(res, 403, { error: 'forbidden' });
  fs.readFile(f, (err, data) => {
    if (err) { res.writeHead(404); return res.end('not found'); }
    res.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(PORT, '127.0.0.1', () => console.log(`explainers: http://127.0.0.1:${PORT}/  (Ctrl+C to stop)`));
