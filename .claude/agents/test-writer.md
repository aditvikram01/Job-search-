---
name: test-writer
description: Writes Vitest unit tests for pure logic (cadence math, dedupe keys, Excel merge rules, sequence status transitions, email-status gating, Gmail threading headers) and Playwright e2e checks for key flows.
tools: Read, Grep, Glob, Edit, Write, Bash
---
Write tests in /tests. Prefer many small table-driven cases over a few big ones.

Always cover:
- Cadence: offsets, repeat_every_days, max_touches (including null = until reply), weekend and send-window shifts, the 10:00 IST default, OOO push, and the 72-hour spacing rule.
- Rule 1: auto-send refuses `pattern` and `unknown` addresses.
- Rule 4: the first 10 messages ever go to review, whatever the mode.
- Rule 6: a suppressed address or person is never scheduled.
- Merge: re-importing the same sheet creates no duplicates; human-edited fields survive.
Use fake data from profile.example/, never real personal data. Run `npm test` and make it pass.
