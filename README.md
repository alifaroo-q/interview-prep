# Interview prep: interactive explainers

Visual, hands-on explanations of system design topics. Each explainer is one HTML file. Some labs run real engines: PostgreSQL and SQLite in your browser, and psql, Redis, `dig` and `curl` in Docker.

## Open the explainers

```
scripts/serve.sh            # real browser labs (PostgreSQL, SQLite). First run fetches the engines (about 20 MB).
scripts/serve.sh --docker   # also real server labs: two psql sessions, Redis, dig, curl
```

Then open http://127.0.0.1:8787/. Needs Node, and Docker for `--docker`. After the first run, everything works offline except `dig` and `curl` to real hosts. Opened by double-click, an explainer still shows its diagrams and model labs, but not the real labs.

## Explainers

| Explainer | What it covers | Built from |
|---|---|---|
| [Microservices](explainers/microservices-explained.html) | 23 chapters: request path, gateways, discovery, resilience, messaging, caching, outbox, sagas, observability, security, deployment | `notes/microservices-architecture.md` |
| [DNS](explainers/dns-explained.html) | 14 chapters: full lookup end to end, root/TLD/authoritative servers, caching, record types, wire format, reverse DNS, DNSSEC, DoH/DoT | Cloudflare Learning Center, RFCs, root-servers.org |
| [SQL and PostgreSQL](explainers/sql-postgres-explained.html) | 32 chapters: relational model, joins, GROUP BY, window functions, subqueries, CTEs, the path of a query, heap pages and tuples, MVCC, VACUUM, shared buffers, WAL, B-tree and other indexes, planner, executor, join and sort algorithms, EXPLAIN, query optimization, isolation, locks, pooling, replication, partitioning, monitoring and security | PostgreSQL 18 docs and source tree READMEs, PgBouncer docs |
| [SQL joins and relations](explainers/sql-joins-explained.html) | 16 chapters: keys, foreign keys, 1:1 / 1:N / M:N relationships, the pair model of a join, INNER, LEFT, RIGHT, FULL, CROSS and self joins, semi and anti joins, NULL in joins, row multiplication, USING / NATURAL / range joins / LATERAL, join algorithms, using joins efficiently, choosing a join | PostgreSQL 18 docs (Table Expressions, Constraints, Subquery Expressions), PostgreSQL source |

Progress ("Mark chapter as read") is saved in your browser's localStorage.

## Make a new explainer

In Claude Code, in this folder:

```
/new-explainer <topic>
```

Examples:

```
/new-explainer how TLS 1.3 works, handshake to first byte
/new-explainer notes/kafka.md, cover every section
```

`/new-explainer` runs the `/pstack:teach` skill and follows the rules in [CLAUDE.md](CLAUDE.md). You can also call the skill directly, for example `/pstack:teach create an interactive HTML explainer of <topic>`. CLAUDE.md is loaded automatically in this folder, so the same rules apply.

To give your own notes as input, put a Markdown file in `notes/` and name it in the command.

## Layout

```
explainers/        one self-contained HTML file per topic
notes/             source notes that explainers are built from
template.html      starting point: page shell, styles, diagram and lab helpers, real-lab examples
runtime/lab.js     real-lab runtime: PGlite and sql.js consoles, Docker tool sessions
runtime/vendor/    WASM engines, fetched by scripts/vendor.sh (not in git)
lab/               lab server (serves the pages, runs tools in Docker) and its compose file
scripts/serve.sh   start the lab server; --docker also starts the Docker services
scripts/check.sh   static checks, plus a real run of every browser-lab query
CLAUDE.md          rules for writing explainers (language, sources, diagrams, labs, checks)
.claude/commands/  the /new-explainer command
```

## Checks

```
scripts/check.sh                      # all explainers
scripts/check.sh explainers/dns-explained.html
```

It checks JS syntax, leftover template placeholders, em dashes, script ids with no element, that every chapter has a "Mark as read" button, and real-lab wiring. It also runs every browser-lab query on the real engine in Node. It does not click the labs or run the Docker labs. Test those in a browser.
