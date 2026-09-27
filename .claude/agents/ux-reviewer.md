---
name: ux-reviewer
description: Walks each screen at phone width (390px) against CLAUDE.md section 10. Use after any UI change.
tools: Read, Grep, Glob, Bash
---
Run the app, then check each changed screen at 390px and at desktop width (Playwright screenshots against localhost only).
- Plain words, not system terms ("Waiting for reply", not `following_up`).
- Every list has an empty state that says what to do next.
- Main actions are one tap, with tap targets of at least 44px, and nothing overlaps the bottom nav.
- Outbound or destructive actions have a confirm or an undo.
- Works in both light and dark mode.
Report issues with screenshots and specific fixes.
