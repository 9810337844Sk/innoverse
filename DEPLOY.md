# PhotoFly — Deployment Guide

This guide covers deploying the full stack:

| Service | Platform | Cost |
|---|---|---|
| **Frontend (Next.js)** | Vercel | Free / Pro |
| **AI Service (FastAPI)** | Railway | ~$5/mo |
| **Database** | Supabase | Free tier |
| **Photos (Drive)** | Google Drive | Free |
| **Photos (Direct Upload)** | Cloudinary | Free tier |

---

## Step 1 — Supabase (Database)

1. Go to [supabase.com](https://supabase.com) → New Project
2. Note your **Project URL** and **Service Role Key** (Settings → API)
3. Go to **SQL Editor → New Query**, paste the entire contents of `supabase_schema.sql`, and run it
4. If upgrading an existing DB, also run:
   ```sql
   ALTER TABLE public.photos ADD COLUMN IF NOT EXISTS faces JSONB NOT NULL DEFAULT '[]'::jsonb;
   ALTER TABLE public.events ADD COLUMN IF NOT EXISTS drive_refresh_token TEXT;
   ```

---

## Step 2 — Google OAuth (Drive Integration)

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a project → Enable **Google Drive API**
3. Go to **Credentials → Create OAuth 2.0 Client ID** (Web application)
4. Add Authorized Redirect URIs:
   ```
   http://localhost:3000/api/drive/callback        ← for local dev
   https://your-app.vercel.app/api/drive/callback  ← for production
   ```
5. Note your **Client ID** and **Client Secret**

---

## Step 3 — AI Service on Railway

The AI service (FastAPI + DeepFace) cannot run on Vercel. Deploy it on Railway:

1. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub repo
2. Set the **Root Directory** to `ai-service`
3. Add these environment variables in Railway:
   ```
   APP_URL=https://your-app.vercel.app
   INTERNAL_SECRET=generate-a-long-random-string
   ```
4. Railway auto-detects Python via `requirements.txt` and uses `uvicorn`
5. Note the generated Railway URL (e.g. `https://photofly-ai.up.railway.app`)

> **First deploy takes ~5 minutes** — Railway downloads the Facenet512 model (~90 MB).

### Alternative: Render

1. [render.com](https://render.com) → New Web Service → connect repo
2. Root directory: `ai-service`
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Same env vars as above

---

## Step 4 — Vercel (Frontend / Next.js)

### 4a. Push to GitHub

Make sure your code is on GitHub. Vercel deploys from Git.

### 4b. Import Project

1. Go to [vercel.com](https://vercel.com) → Add New Project → Import Git Repository
2. Select your repo
3. **Root Directory** → set to `frontend`
4. Framework preset: **Next.js** (auto-detected)
5. Click **Deploy** (it will fail first — that's ok, we still need env vars)

### 4c. Set Environment Variables

Go to your Vercel project → **Settings → Environment Variables** and add all of these:

#### App URLs
```
NEXT_PUBLIC_APP_URL        = https://your-app.vercel.app
NEXT_PUBLIC_API_URL        = https://your-app.vercel.app/api
AI_SERVICE_URL             = https://your-railway-ai-url.railway.app
```

#### Supabase
```
NEXT_PUBLIC_SUPABASE_URL   = https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY  = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Auth
```
AUTH_SECRET                = (run: openssl rand -base64 32)
```

#### Google Drive
```
GOOGLE_CLIENT_ID           = xxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET       = GOCSPX-...
GOOGLE_REDIRECT_URI        = https://your-app.vercel.app/api/drive/callback
```

#### Cloudinary (for direct photo uploads)
```
CLOUDINARY_CLOUD_NAME      = your_cloud_name
CLOUDINARY_API_KEY         = your_api_key
CLOUDINARY_API_SECRET      = your_api_secret
```

#### Email (SMTP)
```
SMTP_HOST                  = smtp.gmail.com
SMTP_PORT                  = 587
SMTP_SECURE                = false
SMTP_USER                  = your@gmail.com
SMTP_PASS                  = your_gmail_app_password
SMTP_FROM                  = PhotoFly <your@gmail.com>
```

#### Internal Security (must match AI service)
```
INTERNAL_SECRET            = same-value-as-railway
```

### 4d. Redeploy

After setting all env vars, go to **Deployments → Redeploy** (latest deployment).

---

## Step 5 — Update AI Service with Vercel URL

After Vercel deploys successfully, go back to Railway and update:
```
APP_URL = https://your-actual-vercel-url.vercel.app
```
Then redeploy the Railway service so the callback URL is correct.

---

## Step 6 — Verify the Deployment

Run these checks after deploying:

| Check | URL |
|---|---|
| Landing page loads | `https://your-app.vercel.app` |
| AI service health | `https://your-railway-ai.up.railway.app/health` |
| Auth works | Login at `/auth/login` with demo creds |
| Drive works | Photographer → event → connect Drive |
| Guest search | `/find` → enter event code → upload selfie |

---

## Custom Domain (Optional)

In Vercel → **Settings → Domains** → Add your domain (e.g. `photofly.com`)

Then update in Vercel env vars:
```
NEXT_PUBLIC_APP_URL = https://photofly.com
GOOGLE_REDIRECT_URI = https://photofly.com/api/drive/callback
```

Also update the Google OAuth redirect URIs in Google Cloud Console to include the new domain.

---

## Plan Limits

| Feature | Vercel Hobby | Vercel Pro |
|---|---|---|
| Serverless function timeout | 10s | 60s |
| Request/response body | 4.5 MB | 4.5 MB |
| Bandwidth | 100 GB/mo | 1 TB/mo |

> Face search (`/api/search/face`) needs up to 35s — **Vercel Pro is required**.  
> Drive import (`/api/drive/import`) needs up to 60s — **Vercel Pro is required**.

---

## Troubleshooting

| Error | Fix |
|---|---|
| `AI service unavailable` | Check Railway is running: visit `/health` endpoint |
| `Drive not connected` | Re-authorize Drive — the cookie expired |
| `Event not found` | Check event `is_active = true` in Supabase |
| `INTERNAL_SECRET mismatch` | Ensure Railway and Vercel have the same value |
| Build fails: `Module not found` | Run `npm install` locally and push updated `package-lock.json` |
| Images not loading | Add your Vercel domain to `next.config.js` `remotePatterns` |
