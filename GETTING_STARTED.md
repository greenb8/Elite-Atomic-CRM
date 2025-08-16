# Getting Started (Windows, npx-first)

This guide helps you install dependencies, configure Supabase (remote or local), and run the app on Windows using PowerShell and `npx` commands (no `make`).

## Prerequisites

- Node.js 20 (see `.nvmrc` → `v20`)
- npm (bundled with Node)
- Supabase CLI (use `npx supabase` so no global install required)
- Optional for local stack: Docker Desktop running

---

## 1) Install dependencies

```powershell
npm install
```

---

## 2) Configure the backend (choose ONE)

### Option A — Use a REMOTE Supabase (recommended)

1) Login and link to your project (replace with your project ref):
```powershell
npx supabase login
# Optionally avoid password prompt by setting your DB password temporarily
$env:SUPABASE_DB_PASSWORD="<your-db-password>"
npx supabase link --project-ref <your-project-ref>
```
> If you see a "Local config differs" diff for `supabase/config.toml`, it's safe to ignore for development.

2) Create frontend env files for the remote instance:
- Create `.env.local` at the repository root with:
```ini
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
# Optional: displayed in the UI
# VITE_INBOUND_EMAIL=xxxxxxxx@inbound.postmarkapp.com
```
- (Recommended for deployment) Also create `.env.production.local` with the same two variables.

3) Apply schema and deploy functions to remote:
```powershell
# First try a straight push (works if remote is empty or already in sync)
npx supabase db push
npx supabase functions deploy
```
If you see migration history mismatches or errors because the remote already has schema:
```powershell
# Baseline the remote schema into a local migration
npx supabase db pull
# When prompted, accept to mark the pulled version as applied on remote
# Then push your repo migrations and deploy functions
npx supabase db push
npx supabase functions deploy
```
> Avoid `npx supabase db reset --linked` on hosted projects unless you intend to wipe all user data and fully own all objects; it can fail due to ownership of Supabase-managed objects. Prefer `db pull` → `db push`.

4) Auth callback settings (remote):
- Supabase Dashboard → Authentication → URL Configuration
  - For local testing against remote: Site URL `http://localhost:5173/`
  - When deployed: Site URL = your production URL
  - If the app is served under a subpath, add `.../auth-callback.html` to allowed redirects

5) SMTP (recommended) & inbound email (optional):
- Configure a real SMTP provider in Supabase Auth for invites/password recovery.
- If using Postmark inbound email, set function secrets:
```powershell
npx supabase secrets set POSTMARK_WEBHOOK_USER=<user>
npx supabase secrets set POSTMARK_WEBHOOK_PASSWORD=<password>
npx supabase secrets set POSTMARK_WEBHOOK_AUTHORIZED_IPS=<comma-separated-IPs>
```


## 3) Run the app

```powershell
npm run dev
```

- First launch will redirect you to sign up and create the initial user (via Supabase Auth).

---

## 4) Optional tasks

- Run tests:
```powershell
npm test
```

- Lint & format check:
```powershell
npm run lint:check
npm run prettier:check
```

- Storybook (UI components):
```powershell
npm run storybook
```

- Build & preview:
```powershell
npm run build
npm run preview
```

---

## Troubleshooting (Windows)

- Port 54322 in use (local Supabase DB):
```powershell
npx supabase stop
Get-Process -Id (Get-NetTCPConnection -LocalPort 54322).OwningProcess | Stop-Process -Force
```
Re-run `npx supabase start`.

- Missing env error at startup: ensure `.env.local` contains `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

- Migration mismatch (remote): prefer `npx supabase db pull` to baseline, then `npx supabase db push`.
