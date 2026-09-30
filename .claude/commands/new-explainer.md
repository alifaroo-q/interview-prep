---
description: Create a new interactive HTML explainer in this repo
argument-hint: <topic, or a path in notes/, plus any focus>
---

Create a new interactive explainer for: $ARGUMENTS

1. Invoke the `pstack:teach` skill for this topic.
2. Follow every rule in `CLAUDE.md`: primary sources, STE language, build-up diagrams, labs, the template, and the checks.
3. Start from `template.html` and save the result as `explainers/<slug>-explained.html`.
4. Run `scripts/check.sh`, then test every lab in Chrome with the DevTools MCP.
5. Add a row for the new explainer to the table in `README.md`.
