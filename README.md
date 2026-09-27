# Outreach Desk

A private web app for a tech-law job search: find people and opportunities,
send tailored first emails, and follow up until they reply. Two users only.

The full spec is in [`CLAUDE.md`](CLAUDE.md). This README covers setup.

**Status:** Phase 0 (login, database, app shell) is done. See CLAUDE.md section 11 for the phases.

## Deploy to Vercel (about 20 minutes, all free tiers)

### 1. Database: Neon
1. Create a free project at [neon.tech](https://neon.tech).
2. Copy the **pooled** connection string. This is `DATABASE_URL`.
3. Create the tables once from your machine:
   ```bash
   npm install
   DATABASE_URL="postgres://..." npm run db:migrate
   ```

### 2. Google login: Google Cloud
1. At [console.cloud.google.com](https://console.cloud.google.com), create a project called "Outreach Desk".
2. **APIs & Services → OAuth consent screen:** choose External, fill in the app name and your email, and add both of your emails as test users.
3. **Credentials → Create credentials → OAuth client ID → Web application.**
   - Authorised JavaScript origins: `https://<your-app>.vercel.app` and `http://localhost:3000`
   - Authorised redirect URIs:
     - `https://<your-app>.vercel.app/api/auth/callback/google`
     - `http://localhost:3000/api/auth/callback/google`
4. Copy the client ID and secret. These are `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET`.

Phase 3 adds the Gmail scopes and the "In production" publishing step (CLAUDE.md section 7). Login alone needs neither.

### 3. Vercel
1. **Add New → Project**, then import this GitHub repo. The framework is detected as Next.js.
2. Add the Phase 0 variables from [`.env.example`](.env.example) under **Environment Variables**:
   `DATABASE_URL`, `AUTH_SECRET`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `ALLOWED_EMAILS`, `TOKEN_ENCRYPTION_KEY`.
   Generate the two secrets with `openssl rand -base64 32`.
3. Deploy, then put the real Vercel URL into the Google redirect URIs from step 2.
4. Open the app, sign in, and go to **Settings → System check**. Everything under "System check" should be green.

**Phase 0 is done when** both of you can sign in and any other Google account gets "This app is private".

## Local development

```bash
cp .env.example .env.local   # fill in the Phase 0 values
npm install
npm run dev                  # http://localhost:3000
npm run check                # typecheck + lint + unit tests
```

Personal files (`profile/inventory.md`, `seed/Outreach-Desk.xlsx`) go in the gitignored
`profile/` and `seed/` folders locally. They must never be committed (CLAUDE.md rule 7).
