# Interview prep: interactive explainers

Visual, hands-on explanations of system design topics. Each explainer is one HTML file. Open it in a browser. It needs no install and no internet.

## Explainers

| Explainer | What it covers | Built from |
|---|---|---|
| [Microservices](explainers/microservices-explained.html) | 23 chapters: request path, gateways, discovery, resilience, messaging, caching, outbox, sagas, observability, security, deployment | `notes/microservices-architecture.md` |
| [DNS](explainers/dns-explained.html) | 14 chapters: full lookup end to end, root/TLD/authoritative servers, caching, record types, wire format, reverse DNS, DNSSEC, DoH/DoT | Cloudflare Learning Center, RFCs, root-servers.org |

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
template.html      starting point: page shell, styles, diagram and lab helpers
scripts/check.sh   static checks for every explainer
CLAUDE.md          rules for writing explainers (language, sources, diagrams, labs, checks)
.claude/commands/  the /new-explainer command
```

## Checks

```
scripts/check.sh                      # all explainers
scripts/check.sh explainers/dns-explained.html
```

It checks JS syntax, leftover template placeholders, em dashes, script ids with no element, and that every chapter has a "Mark as read" button. It does not click the labs. Test those in a browser.
