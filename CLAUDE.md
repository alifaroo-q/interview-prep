# Explainer guidelines

This repo holds interactive HTML explainers for interview prep, one HTML file per topic in `explainers/`. The goal of each explainer is a correct **mental model**: the reader can predict what the system does, because they watched its **hidden state** change under their own inputs. Follow these rules when you create or change one.

## Workflow

1. **Start with `/pstack:teach`.** Every explainer is a teaching task. Plain definition first, then how it works and why, with the depth where the user's question is.
2. **Read the input.** If the user gives notes (in `notes/`), cover every section in them. Keep a "Covers: §…" line per chapter so coverage can be checked.
3. **Check facts against primary sources** (list below) before writing. Put the sources for each chapter in its `<div class="topics">` line.
4. **Write the lab plan** before any HTML. For each chapter: the mechanism, the hidden state that carries it, the tier (see **Lab ladder**), and the **break it** case. Done when every chapter with a mechanism has all four.
5. **Copy `template.html`** to `explainers/<slug>-explained.html`. Replace every `{{PLACEHOLDER}}`. `{{SLUG}}` must be unique, since it is the localStorage key for progress.
6. **Write chapters, then labs**, then run **Checks before done**.

## Content rules

- **Language:** ASD-STE100 Simplified Technical English. Short sentences, common words, a 15-year-old should follow it. No em dashes. No stock metaphors. No filler.
- **Depth:** explain the problem each part solves and the mechanism, not only the name. Include edge cases, failure modes and trade-offs.
- **No framing labels** such as "key insight", "TL;DR", "the tricky part". No quizzes.
- **One name per concept.** Pick a term and keep it.
- **Chapter shape:** title, `topics` line (coverage + sources), a `lead` paragraph with the plain definition, then explanation, build-up diagrams, labs, tables, and a "Mark chapter as read" button.

## Diagram rules

- Anything with 3+ parts is a **build-up diagram** (`.build`): each step adds one part (`data-s="n"`) with one caption. A whole system shown at once is only ever the last step.
- Node classes: `client`, `edge`, `svc`, `data`, `msg`, `plat`, `bad`. See the table in `template.html`.

## Labs

Each chapter with a mechanism gets at least one lab. A lab earns its place when it does all three:

- **Hidden state visible.** Show the internal state the concept is about, not only the final answer: heap tuples, the lock queue, the plan tree, cache entries, the DNS referral chain. On a real engine, query its introspection (`pageinspect`, `pg_locks`, `EXPLAIN (ANALYZE, BUFFERS)`, `dig +trace`, `redis-cli OBJECT`, `curl -v`).
- **Reader drives.** The reader changes an input, toggles a fault or steps through a sequence, and sees the state change. Presets give a guided path; free input lets them go past it.
- **Break it.** At least one preset or control shows the failure mode or edge case the chapter warns about, on screen.

### Lab ladder

Take the first tier that can show the mechanism:

1. **Real lab, tier 1 (browser).** PostgreSQL 18 via PGlite (with contrib extensions such as `pageinspect`, `pg_buffercache`, `pg_visibility`, `pg_walinspect`), SQLite via sql.js. Declarative markup, no JS. Limit: one connection per database.
2. **Real lab, tier 2 (Docker).** Concurrent sessions (locks, isolation, deadlocks), servers (Redis, Kafka, an nginx gateway over three replicas with Toxiproxy fault injection), network tools (`dig`, `curl`, an Unbound caching resolver). Runs in Docker through the lab server. Needs `scripts/serve.sh --docker`. The services and their names are in `lab/compose.yaml`.
3. **Model lab (JS).** For what no local tool can show: a 50-service outage, a cluster over time, packet timing, or internal steps the engine hides. Model real behaviour with real numbers from sources, and label example numbers as examples.

Pair them: a model lab shows the mechanism step by step, then a real lab on the same data shows the real engine does the same thing. The hint of every lab says what to run and what to watch.

Markup and API: the example chapter in `template.html`, and the comments in `runtime/lab.js`. A new tier 2 tool is one service in `lab/compose.yaml` plus one entry in `TOOLS` in `lab/server.mjs`.

### Lab rules

- A preset that must fail on purpose (to show an error) carries `data-expect-error`. Every other tier 1 query must run clean, since `scripts/check.sh` runs them all.
- Tier 2 labs share one database per tool. Give each lab its own table names, and make setup idempotent (`DROP ... IF EXISTS`).
- Model labs: one IIFE per lab, using the core script helpers `$`, `$$`, `log`, `stat`, `sleep`, `rnd`, `pick`.
- Fake data uses documentation IP ranges (192.0.2.0/24, 198.51.100.0/24, 203.0.113.0/24, 2001:db8::/32) and made-up domains like `acmeshop.com`. Real infrastructure (root servers, gtld-servers) uses real values.
- Everything runs locally: engines are vendored by `scripts/vendor.sh` into `runtime/vendor/`, with no CDN and no network calls from the page. Pages open through `scripts/serve.sh` (http://127.0.0.1:8787/). Model labs still work when the file is opened by double-click.

## Primary sources

Prefer, in order:

1. **Standards:** RFCs (rfc-editor.org), IANA (iana.org), W3C / WHATWG specs.
2. **Operators of the thing:** root-servers.org, ICANN, Kubernetes docs (kubernetes.io), Kafka and RabbitMQ docs, Redis docs, PostgreSQL docs, OpenTelemetry docs.
3. **Vendor learning centres with strong reputations:** Cloudflare Learning Center (cloudflare.com/learning), AWS Architecture Center and docs, Google Cloud docs, MDN Web Docs.
4. **Pattern references:** microservices.io (Chris Richardson), martinfowler.com.

Notes:
- **Cloudflare returns 403 to plain fetches.** Open the page with the Chrome DevTools MCP (`navigate_page`), then `evaluate_script` to fetch other Learning Center pages from inside the page and save the text to a file.
- When a fact changes over time (counts, versions, defaults), take it from the most current primary source, write the date checked, and note if a vendor page is older. Example: root server instances "2,045 as of 2026-09-30 per root-servers.org", while Cloudflare's page says "over 600".
- Write only numbers a source gives. Label a rough typical value as rough. Timings from a real lab are "on your machine, will vary".

## Checks before done

1. `scripts/check.sh` passes. It checks JS syntax, placeholders, em dashes, element ids, chapter/button count and real-lab wiring, and runs every tier 1 query on the real engine.
2. With `scripts/serve.sh --docker` running, open the page at http://127.0.0.1:8787/ with the Chrome DevTools MCP. Click every build-up step, every lab control and every preset. Done when each output shows what its hint promises and the console has no errors.
3. Take at least one screenshot of a diagram, a model lab and a real lab to check the layout.
4. Add the explainer to the table in `README.md`.
