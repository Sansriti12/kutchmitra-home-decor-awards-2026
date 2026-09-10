# Deployment Guide — Kutchmitra Home & Decor Awards 2026

## 1. Overview
The Kutchmitra Home & Decor Awards 2026 platform utilizes a decoupled, modern cloud deployment architecture:
- **Public Website & Frontend Portal:** Next.js 14 (App Router) deployed on Vercel
- **Database & Identity (Future Step 8+):** PostgreSQL / Auth via Supabase
- **Edge CDN & DNS:** Vercel Global Edge Network with SSL

---

## 2. GitHub Repository Setup

### Repository Details
- **Repository Name:** `kutchmitra-home-decor-awards-2026`
- **Initial Visibility:** Private (recommended for pre-launch client review)
- **Default Branch:** `main`

### Excluded from Version Control
The project's `.gitignore` guarantees that sensitive or ephemeral assets are never tracked:
- `.env`, `.env.local`, `.env*.local` (Local environment files)
- `/node_modules` (Dependencies)
- `/.next`, `/build`, `/out` (Build artifacts)
- `.vercel` (Local Vercel project linkage)
- `*.log` (Debug and error logs)

---

## 3. Vercel Deployment Process

### Architecture & Build Configuration
- **Framework Preset:** Next.js (automatically detected by Vercel)
- **Node.js Version:** 18.x / 20.x
- **Build Command:** `npm run build` (or `next build`)
- **Output Directory:** Next.js default (`.next`)
- **Install Command:** `npm install`

### Manual Connect & Deploy via Vercel Dashboard
1. Log in to your [Vercel Dashboard](https://vercel.com).
2. Click **"Add New..."** → **"Project"**.
3. Under **"Import Git Repository"**, select your GitHub account and find `kutchmitra-home-decor-awards-2026`.
4. Click **"Import"**.
5. In **"Configure Project"**:
   - **Project Name:** `kutchmitra-home-decor-awards-2026`
   - **Framework Preset:** Next.js
   - **Root Directory:** `./`
   - **Environment Variables:** None required for this first cut.
6. Click **"Deploy"**.
7. Vercel will trigger an automated build, compile all 28 static pages, and assign a production URL (e.g. `https://kutchmitra-home-decor-awards-2026.vercel.app`).

---

## 4. Environment Variables Policy
- **First Cut (Current Stage):** Zero environment variables required. The public website operates 100% frontend-first without backend dependencies.
- **Future Backend (Step 8+):** When Supabase authentication and database connections are integrated, the following keys will be configured in Vercel Project Settings > Environment Variables:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (Sensitive — Production only)
  - `DATABASE_URL` (Sensitive — Backend migrations only)

*NEVER commit actual secret keys into source code or Git history.*

---

## 5. Live Production URLs
- **Vercel Preview / Production URL:** Assigned upon project import on Vercel (e.g. `https://kutchmitra-home-decor-awards-2026.vercel.app`).
- **Official Custom Domain:** To be mapped to the official domain prior to ceremony launch.

---

## 6. Continuous Deployment & Future Update Workflow
Once the GitHub repository is connected to Vercel, updates are completely automated:

```
Local Changes
     ↓
git add .
     ↓
git commit -m "Description of changes"
     ↓
git push origin main
     ↓
GitHub receives commit
     ↓
Vercel webhook triggers automated build
     ↓
Live website updated within 60 seconds
```

### Rollback Procedure
If an issue occurs in production:
1. Navigate to the **Deployments** tab in the Vercel dashboard.
2. Select the previous stable deployment.
3. Click the three dots (`...`) → **"Promote to Production"**.
4. Rollback completes instantly without rebuild delays.

