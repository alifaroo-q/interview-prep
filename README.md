# Interview prep: interactive explainers

Visual, hands-on explanations of system design topics. Each explainer is one HTML file. Some labs run real engines: PostgreSQL and SQLite in your browser, and psql, Redis, `dig`, `curl`, a CDN edge cache (nginx), a TCP/TLS client (curl, openssl, tcpdump, tc) and a local AWS emulator ([Floci](https://floci.io)) with the real AWS CLI in Docker.

## Open the explainers

```
scripts/serve.sh            # real browser labs (PostgreSQL, SQLite). First run fetches the engines (about 20 MB).
scripts/serve.sh --docker   # also real server labs: two psql sessions, Redis, dig, curl, a CDN edge cache, a TCP/TLS client, AWS (Floci)
```

Then open http://127.0.0.1:8787/. Needs Node, and Docker for `--docker`. After the first run, everything works offline except `dig` and `curl` to real hosts. The AWS labs pull more images on first use (Amazon Linux for EC2, `traefik/whoami` for ECS, the AWS Lambda Python 3.12 image, about 750 MB). Floci starts these containers through the Docker socket and labels them `floci=true`; `serve.sh` removes them on exit. Opened by double-click, an explainer still shows its diagrams and model labs, but not the real labs.

## Explainers

| Explainer | What it covers | Built from |
|---|---|---|
| [AWS core services](explainers/aws-explained.html) | 22 chapters: Regions and AZs, VPS vs EC2, EBS / instance store / EFS, VPC, IAM, S3, ALB and NLB, Auto Scaling, ECS and Fargate, EKS, Lambda, API Gateway, RDS and Aurora, DynamoDB, ElastiCache, SQS, SNS / EventBridge / Kinesis, CloudFront, Route 53, KMS and Secrets Manager, CloudWatch and CloudTrail, a whole app across AZs. Real labs on Floci with the AWS CLI: SigV4 requests, EC2 states, IAM allow / deny and AssumeRole, S3 versions and presigned URLs, a real ALB with health checks, the Auto Scaling and ECS reconcile loops, Lambda environment reuse, DynamoDB capacity units, SQS visibility and DLQ, SNS filters, KMS data keys, CloudWatch alarm states | `notes/aws-lab-plan.md`, `notes/aws-sources-*.md`: AWS docs and product pages (checked 2026-10-07), kubernetes.io |
| [Connections: TCP, TLS, HTTP/2, QUIC](explainers/tcp-tls-explained.html) | 14 chapters: two connections through a CDN, TCP three-way handshake, TLS 1.3 handshake, resumption and 0-RTT replay, keep-alive and TIME-WAIT, pools and Little's law, HTTP/1.1 head-of-line blocking, HTTP/2 frames and streams, TCP head-of-line blocking, QUIC and HTTP/3, connection migration, anycast and BGP, tiers and the backbone, one request end to end. Real labs: tcpdump of a handshake, SYN retries, openssl handshake messages, HelloRetryRequest, a replayed 0-RTT POST, TIME-WAIT sockets, HTTP/2 stream IDs, retransmits under loss, real HTTPS records and Alt-Svc | `notes/tcp-tls.md`, RFC 9293/6298/8446/9112/9113/9000/9001/9114/9460/4271/4786, Linux docs, nginx and OpenSSL docs. Sources in `notes/tcp-tls-sources.md` |
| [Full stack interview](explainers/fullstack-interview-explained.html) | 15 chapters of easy, medium and hard questions with answers and real incidents (no DSA): how to answer, URL to pixels, HTTP and REST, the event loop, rendering and Web Vitals, React, client data fetching, auth, web security, databases in app code, caching, scaling and rate limits, real-time, deploys and migrations, system design and a pattern map. Real labs: curl and TLS, PostgreSQL (browser and two Docker sessions), Redis, nginx, the browser's own JS engine, WebCrypto and layout-shift API | `notes/fullstack-lab-plan.md`, `notes/fullstack-sources-*.md`: RFCs, WHATWG, MDN, web.dev, react.dev, OWASP, PostgreSQL and Redis docs, SEC, ICO, company postmortems |
| [CDNs](explainers/cdn-explained.html) | 12 chapters: round trips and distance, anycast and DNS steering, cache hit and miss, what may be cached (GET, POST, Cache-Control), cache key and Vary, revalidation and stale copies, coalescing and tiered cache, the cost of a new connection, origin connection pools, multiplexing, the backbone, DDoS. Real labs on an nginx edge cache in front of an nginx origin | `notes/cdn.md`, RFC 9110/9111/9113/5861/8446, nginx docs, Cloudflare, CloudFront and Fastly docs |
| [Microservices](explainers/microservices-explained.html) | 23 chapters: request path, gateways, discovery, resilience, messaging, caching, outbox, sagas, observability, security, deployment | `notes/microservices-architecture.md` |
| [DNS](explainers/dns-explained.html) | 14 chapters: full lookup end to end, root/TLD/authoritative servers, caching, record types, wire format, reverse DNS, DNSSEC, DoH/DoT | Cloudflare Learning Center, RFCs, root-servers.org |
| [SQL and PostgreSQL](explainers/sql-postgres-explained.html) | 32 chapters: relational model, joins, GROUP BY, window functions, subqueries, CTEs, the path of a query, heap pages and tuples, MVCC, VACUUM, shared buffers, WAL, B-tree and other indexes, planner, executor, join and sort algorithms, EXPLAIN, query optimization, isolation, locks, pooling, replication, partitioning, monitoring and security | PostgreSQL 18 docs and source tree READMEs, PgBouncer docs |
| [Correlated subqueries](explainers/correlated-subquery-explained.html) | 9 chapters on one slow query: how a correlated subquery runs (SubPlan), reading `loops` in EXPLAIN ANALYZE, why the join with no index was not the cause, the aggregate-then-join rewrite and its NULL and count traps, the index without the rewrite, Index Only Scans and the visibility map, the two fixes measured apart, and when the correlated subquery is the correct form. Real labs: PostgreSQL in the browser at 3,000 rows and a Docker server at 30,000 rows | `notes/sub-query.md`, `notes/sub-query-lab-plan.md`, PostgreSQL 18 docs, PostgreSQL 12 release notes. The plans in the notes were replaced with measured ones |
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
