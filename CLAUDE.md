# Explainer guidelines

This repo holds interactive HTML explainers for interview prep. Each explainer is one self-contained HTML file in `explainers/`. Follow these rules when you create or change one.

## Workflow

1. **Start with `/pstack:teach`.** Every explainer is a teaching task. Invoke the `pstack:teach` skill with the topic and follow it: plain definition first, then how it works and why, with the depth where the user's question is.
2. **Read the input.** If the user gives notes (in `notes/`), cover every section in them. Keep a "Covers: §…" line per chapter so coverage can be checked.
3. **Check facts against primary sources** (list below) before writing. Put the sources for each chapter in its `<div class="topics">` line.
4. **Copy `template.html`** to `explainers/<slug>-explained.html`. Replace every `{{PLACEHOLDER}}`. `{{SLUG}}` must be unique, since it is the localStorage key for progress.
5. **Write chapters, then labs**, then run the checks (below).

## Content rules

- **Language:** ASD-STE100 Simplified Technical English. Short sentences, common words, a 15-year-old should follow it. No em dashes. No stock metaphors. No filler.
- **Depth:** explain the problem each part solves and the mechanism, not only the name. Include edge cases, failure modes and trade-offs. Avoid shallow lists.
- **No framing labels** such as "key insight", "TL;DR", "the tricky part". No quizzes.
- **One name per concept.** Pick a term and keep it.
- **Chapter shape:** title, `topics` line (coverage + sources), a `lead` paragraph with the plain definition, then explanation, build-up diagrams, labs, tables, and a "Mark chapter as read" button.

## Diagram rules

- Anything with 3+ parts is a **build-up diagram** (`.build`): each step adds one part (`data-s="n"`) with one caption. Never show a whole system at once as the only picture.
- Node classes: `client`, `edge`, `svc`, `data`, `msg`, `plat`, `bad`. See the table in `template.html`.

## Lab rules

- Each chapter with a mechanism gets at least one lab: the reader changes an input and sees the outcome (failure injection, toggles, sliders, step-through).
- Labs model real behaviour. Use real numbers where they exist (from sources). Label example numbers as examples.
- Use documentation IP ranges (192.0.2.0/24, 198.51.100.0/24, 203.0.113.0/24, 2001:db8::/32) and made-up domains like `acmeshop.com` for fake data. Real infrastructure (root servers, gtld-servers) uses real values.
- One IIFE per lab. Use the helpers in the core script: `$`, `$$`, `log`, `stat`, `sleep`, `rnd`, `pick`.
- No external libraries, CDNs or network calls. The file must work offline by double-click.

## Primary sources

Prefer, in order:

1. **Standards:** RFCs (rfc-editor.org), IANA (iana.org), W3C / WHATWG specs.
2. **Operators of the thing:** root-servers.org, ICANN, Kubernetes docs (kubernetes.io), Kafka and RabbitMQ docs, Redis docs, PostgreSQL docs, OpenTelemetry docs.
3. **Vendor learning centres with strong reputations:** Cloudflare Learning Center (cloudflare.com/learning), AWS Architecture Center and docs, Google Cloud docs, MDN Web Docs.
4. **Pattern references:** microservices.io (Chris Richardson), martinfowler.com.

Notes:
- **Cloudflare returns 403 to plain fetches.** Open the page with the Chrome DevTools MCP (`navigate_page`), then `evaluate_script` to fetch other Learning Center pages from inside the page and save the text to a file.
- When a fact changes over time (counts, versions, defaults), take it from the most current primary source, write the date checked, and note if a vendor page is older. Example: root server instances "2,045 as of 2026-09-30 per root-servers.org", while Cloudflare's page says "over 600".
- Do not invent numbers. If a number is a rough typical value, say so.

## Checks before done

1. `scripts/check.sh` (static checks: JS syntax, leftover placeholders, em dashes, missing element ids, chapter/button count).
2. Open the file in Chrome with the DevTools MCP. Click every build-up step and every lab control, and check there are no console errors.
3. Take at least one screenshot of a diagram and a lab to check the layout.
4. Add the explainer to the table in `README.md`.
