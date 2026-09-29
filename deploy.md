# Deploying the School Management System to Vercel

This project is a Next.js (App Router) app, so Vercel builds it with `next build` and serves the output as a serverless/static deployment. This guide covers **automatic deploys** (every push to GitHub) and **manual CLI deploys**.

## Prerequisites

- A [GitHub](https://github.com) account
- A [Vercel](https://vercel.com) account (sign in with your GitHub account to speed things up)
- [Git](https://git-scm.com) installed locally
- Optional: [Vercel CLI](https://vercel.com/docs/cli) for manual deploys (`npm i -g vercel`)

## Option 1 — Automatic deploys from GitHub (recommended)

Pushing to the `main` branch triggers a production deploy; opening a Pull Request creates a preview deployment.

### 1. Push the project to GitHub

```bash
# In the project root
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<your-username>/school-management-system.git
git push -u origin main
```

### 2. Import the repo on Vercel

1. Go to <https://vercel.com/new>
2. Click **Import** next to your `school-management-system` repository
3. Vercel auto-detects Next.js. Verify/apply these settings:
   - **Framework Preset:** `Next.js`
   - **Build Command:** `npm run build`
   - **Output Directory:** (leave empty — Next.js handles this)
   - **Install Command:** `npm install`
4. Click **Deploy**

### 3. Done — auto-deploy is active

- **Push to `main`** → production deploy at `https://school-management-system.vercel.app`
- **Open a PR** → preview deploy at a unique `*.vercel.app` URL
- Add a custom domain under **Settings → Domains** if you want

## Option 2 — Manual deploy with Vercel CLI

```bash
npm i -g vercel
vercel login

# Preview deployment
vercel

# Production deployment
vercel --prod
```

The CLI reads the included `vercel.json`:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json"
}
```

It only declares the schema — everything else comes from Vercel's Next.js auto-detection.

## How the auto-deploy / GitHub integration works

Vercel's GitHub app watches the repository. On every event it:

1. Clones the latest commit (or PR branch)
2. Runs `npm install` and `next build`
3. Creates a **Production Deployment** for `main` or a **Preview Deployment** for PRs
4. Posts the deploy status back to GitHub (checks on commits, links in PRs)

## Custom domain (optional)

1. Vercel Dashboard → your project → **Settings → Domains**
2. Add your domain, e.g. `school.example.com`
3. Follow Vercel's DNS instructions (add a `CNAME` or `ALIAS` record pointing to `cname.vercel-dns.com`)
4. DNS propagates within minutes; HTTPS certificate is issued automatically

## Environment & data notes

- This app stores all data in **browser `localStorage`** — there is no backend or database.
- Each browser/device holds its own data; there is no cloud sync.
- Because the app is client-rendered against `localStorage`, a fresh browser starts with an empty database and never shares state with other visitors.

## Rollback

To roll back a deploy: Vercel Dashboard → **Deployments** → select a previous deployment → **Redeploy**. Or revert the code on GitHub and push again.
