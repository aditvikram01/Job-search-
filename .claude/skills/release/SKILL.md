---
name: release
description: Pre-push checklist for Outreach Desk. Runs typecheck, lint, unit tests and a production build, and checks that no personal data or secrets are staged. Use before every push.
---
1. `npm run check` (typecheck + lint + unit tests). Fix any failure before continuing.
2. `npm run build`. It must pass with no env vars set.
3. If `lib/db/schema.ts` changed, run `npm run db:generate` and commit the new migration in /drizzle.
4. `git status --short` and `git diff --cached --name-only`. Stop if anything under `profile/` or `seed/`, any `.env*` other than `.env.example`, or any `.xlsx` is staged.
5. Grep the staged diff for key-looking strings (`sk-`, `AIza`, `-----BEGIN`, `postgres://` with a password). Stop if any are found.
6. Push. Vercel builds a preview for the branch; check its Settings → System check page.
