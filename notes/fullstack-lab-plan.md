# Full stack interview explainer: lab plan

Scope: the common non-DSA questions in a full stack interview, at three levels (easy, medium, hard), with answers and real examples, plus the common patterns. Deeper material links to the other explainers (DNS, CDN, microservices, SQL and PostgreSQL).

Tiers: 1 = PGlite in the browser, 2 = Docker through the lab server (`sh` next to the nginx gateway, `redis`, `psql`), 3 = model lab (JS). "Real (browser)" means the lab runs the browser's own engine (JS runtime, WebCrypto, layout, PerformanceObserver). That is the real engine for that mechanism, so it counts as a real lab.

| # | Chapter | Mechanism | Hidden state | Tier | Break it |
|---|---|---|---|---|---|
| 1 | The interview and how to answer | answer shape: definition, mechanism, trade-off, example | (no mechanism, no lab) | - | - |
| 2 | From URL to pixels | DNS, TCP, TLS, HTTP, render; each new connection costs round trips | round trips per step on a timeline; real: curl -v lines, curl -w phase timings, "Re-using existing connection" | 3 + 2 | TLS 1.2 + far server + no reuse; unknown host (curl exit 6) |
| 3 | HTTP and REST API design | methods, status codes, offset vs cursor pagination | rows of page 1 and page 2; real: EXPLAIN ANALYZE rows read for OFFSET | 1 | new row inserted between page 1 and 2: offset shows a row twice, cursor does not |
| 4 | The JavaScript event loop | one call stack, task queue, microtask queue, checkpoint after each task | stack, both queues, output, per step; real: output order and measured timer delay | 3 + real (browser) | busy loop delays a 0 ms timer; microtask flood starves timers; `var` in a loop |
| 5 | Browser rendering and Web Vitals | event rate vs handler rate; layout shift scoring | raw events vs handler calls; layout-shift entries with value and hadRecentInput | real (browser) | no debounce: handler per keystroke; ad without reserved space shifts text |
| 6 | React rendering | reconciliation by key; batched state updates | key to DOM node map; update queue | 3 | index key + add to top: typed text stays with the wrong row; `setCount(count + 1)` three times gives +1 |
| 7 | Client data fetching | requests finish out of order; stale result wins | request table: sent, arrived, applied / ignored / aborted | 3 | no guard: "re" result overwrites "react" result; optimistic update with failed server rolls back |
| 8 | Authentication and sessions | signed tokens vs server sessions; revocation | JWT header, payload, signature, verify result; real: Redis session key, TTL, denylist | real (browser WebCrypto) + 2 | tampered role fails; `alg: none` accepted by a naive verifier; logout does not end a JWT |
| 9 | Web security: XSS, CSRF, SQL injection, CORS | input as code; browser same-origin and preflight rules | SQL text built from input and rows returned; DOM in a sandboxed frame; preflight request/response | 1 + real (browser) + 3 | `' OR '1'='1`; `<img onerror>` via innerHTML; `*` with credentials |
| 10 | Databases in app code | N+1 round trips; index vs scan; lost update | query count and time; EXPLAIN plan; two real sessions | 3 + 1 + 2 | N+1 at 20 ms RTT; read-modify-write sells the last item twice |
| 11 | Caching | cache-aside, TTL, invalidation, stampede | Redis keys and TTLs; DB hits per expiry | 2 + 3 | write without DEL serves stale data; 200 requests at expiry hit the DB 200 times |
| 12 | Scaling and rate limiting | stateless servers behind a load balancer; fixed window counter | which replica answered; session store per server; counter + TTL | 2 + 3 + 2 | in-memory sessions: logged out on other replicas; burst at window edge passes 2x the limit |
| 13 | Real-time updates | polling, long polling, SSE, WebSocket | request timeline, delay per message, requests per minute | 3 | 1 s polling with 10,000 clients |
| 14 | Deploy, migrate, observe | expand and contract; canary; staged rollout | schema + which app version runs; error rate per server | 1 + 3 | rename a column in one step: v1 fails; push to all servers at once |
| 15 | The system design round | estimates; build-up of a URL shortener; pattern map | the arithmetic chain from users to QPS and storage | 3 | ignore peak factor; cache size vs hot set |
