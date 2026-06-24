# PhotoFly Setup Checklist

Yeh checklist follow karein to ensure everything is configured properly for both localhost and production.

---

## 🏠 Localhost Development Checklist

### Step 1: Software Installation
- [ ] Node.js (v18+) installed - Check: `node --version`
- [ ] Python (v3.9+) installed - Check: `python --version`
- [ ] npm installed - Check: `npm --version`
- [ ] Git installed - Check: `git --version`

### Step 2: Clone & Install
- [ ] Repository cloned to local machine
- [ ] `cd photo-event-platform`
- [ ] Frontend dependencies installed: `cd frontend && npm install`
- [ ] AI service venv created: `cd ai-service && python -m venv .venv`
- [ ] AI dependencies installed: `.venv\Scripts\activate && pip install -r requirements.txt`

### Step 3: Create Accounts (Free Tier)
- [ ] **Supabase** account created at [supabase.com](https://supabase.com)
  - [ ] New project created
  - [ ] Project URL noted
  - [ ] Service Role Key noted
  - [ ] SQL schema loaded from `supabase_schema.sql`
  - [ ] Tables verified: users, events, photos, search_logs, payments

- [ ] **Cloudinary** account created at [cloudinary.com](https://cloudinary.com)
  - [ ] Cloud Name noted
  - [ ] API Key noted
  - [ ] API Secret noted

- [ ] **Google Cloud** project created at [console.cloud.google.com](https://console.cloud.google.com)
  - [ ] Google Drive API enabled
  - [ ] OAuth 2.0 Client ID created (Web application)
  - [ ] Redirect URI added: `http://localhost:3000/api/drive/callback`
  - [ ] Client ID noted
  - [ ] Client Secret noted

### Step 4: Configure Frontend Environment
- [ ] `cd frontend`
- [ ] Copy: `cp .env.local.example .env.local`
- [ ] Edit `frontend/.env.local`:

#### Localhost URLs (Already Set)
- [ ] `NEXT_PUBLIC_API_URL=http://localhost:3000/api` ✓
- [ ] `NEXT_PUBLIC_AI_URL=http://localhost:8000` ✓
- [ ] `NEXT_PUBLIC_APP_URL=http://localhost:3000` ✓
- [ ] `AI_SERVICE_URL=http://localhost:8000` ✓

#### Your Credentials
- [ ] `NEXT_PUBLIC_SUPABASE_URL=` (paste your URL)
- [ ] `SUPABASE_SERVICE_ROLE_KEY=` (paste your key)
- [ ] `AUTH_SECRET=` (run: `openssl rand -base64 32`)
- [ ] `CLOUDINARY_CLOUD_NAME=` (paste your cloud name)
- [ ] `CLOUDINARY_API_KEY=` (paste your key)
- [ ] `CLOUDINARY_API_SECRET=` (paste your secret)
- [ ] `GOOGLE_CLIENT_ID=` (paste your client ID)
- [ ] `GOOGLE_CLIENT_SECRET=` (paste your secret)
- [ ] `GOOGLE_REDIRECT_URI=http://localhost:3000/api/drive/callback` ✓
- [ ] `INTERNAL_SECRET=` (any random string, remember for AI service)

### Step 5: Configure AI Service
- [ ] `cd ../ai-service`
- [ ] Copy: `cp .env.example .env`
- [ ] Edit `ai-service/.env`:
  - [ ] `APP_URL=http://localhost:3000` ✓
  - [ ] `INTERNAL_SECRET=` (SAME as frontend!)

### Step 6: Verify Configuration
- [ ] `cd ..` (back to root)
- [ ] Run: `npm run verify`
- [ ] All checks passed ✅
- [ ] `INTERNAL_SECRET` matches in both files
- [ ] No placeholder values remaining

### Step 7: Start Services
- [ ] Terminal 1: `cd frontend && npm run dev`
  - [ ] Frontend running on http://localhost:3000
  - [ ] No errors in console

- [ ] Terminal 2: `cd ai-service && .venv\Scripts\activate && uvicorn main:app --reload --port 8000`
  - [ ] AI service running on http://localhost:8000
  - [ ] Model loaded successfully
  - [ ] No errors in console

### Step 8: Verify Services
- [ ] Open browser: http://localhost:3000
  - [ ] Landing page loads
  - [ ] No console errors (F12)

- [ ] Test AI health: http://localhost:8000/health
  - [ ] Returns: `{"status":"ok"}`

- [ ] Test login: http://localhost:3000/auth/login
  - [ ] Login page loads
  - [ ] Can create account

### Step 9: Test Features
- [ ] Create photographer account
- [ ] Create test event
- [ ] Connect Google Drive (OAuth flow works)
- [ ] Upload test photo
- [ ] Test guest search at `/find`

---

## 🌐 Production Deployment Checklist

### Prerequisites
- [ ] Code committed to GitHub
- [ ] All localhost tests passing
- [ ] GitHub account
- [ ] Vercel account (sign up with GitHub)
- [ ] Railway account (sign up with GitHub)

### Step 1: Deploy AI Service (Railway)
- [ ] Go to [railway.app](https://railway.app)
- [ ] New Project → Deploy from GitHub repo
- [ ] Select your repository
- [ ] Root Directory: `ai-service` ✓
- [ ] Add environment variables:
  - [ ] `APP_URL=https://your-app.vercel.app` (temp value, will update)
  - [ ] `INTERNAL_SECRET=` (generate NEW random string for production)
- [ ] Wait for deployment (~5 mins for first time)
- [ ] Note the Railway URL: `https://xxxxx.up.railway.app`
- [ ] Test health: `https://xxxxx.up.railway.app/health` returns OK

### Step 2: Update Google OAuth for Production
- [ ] Go to [console.cloud.google.com](https://console.cloud.google.com)
- [ ] Your project → Credentials → OAuth 2.0 Client
- [ ] Add production redirect URI:
  - [ ] `https://your-app.vercel.app/api/drive/callback` (will update with real URL)
- [ ] Save

### Step 3: Deploy Frontend (Vercel)
- [ ] Go to [vercel.com](https://vercel.com)
- [ ] New Project → Import Git Repository
- [ ] Select your repository
- [ ] Root Directory: `frontend` ✓
- [ ] Framework Preset: Next.js (auto-detected) ✓
- [ ] Click Deploy (will fail - need env vars)

### Step 4: Configure Vercel Environment Variables
Go to: Project Settings → Environment Variables

#### Production URLs
- [ ] `NEXT_PUBLIC_APP_URL=https://your-actual-vercel-url.vercel.app`
- [ ] `NEXT_PUBLIC_API_URL=https://your-actual-vercel-url.vercel.app/api`
- [ ] `NEXT_PUBLIC_AI_URL=https://your-railway-url.up.railway.app`
- [ ] `AI_SERVICE_URL=https://your-railway-url.up.railway.app`

#### Database & Storage (Same as Localhost)
- [ ] `NEXT_PUBLIC_SUPABASE_URL=` (same value)
- [ ] `SUPABASE_SERVICE_ROLE_KEY=` (same value)
- [ ] `CLOUDINARY_CLOUD_NAME=` (same value)
- [ ] `CLOUDINARY_API_KEY=` (same value)
- [ ] `CLOUDINARY_API_SECRET=` (same value)

#### Auth & Google
- [ ] `AUTH_SECRET=` (generate NEW one: `openssl rand -base64 32`)
- [ ] `GOOGLE_CLIENT_ID=` (same value)
- [ ] `GOOGLE_CLIENT_SECRET=` (same value)
- [ ] `GOOGLE_REDIRECT_URI=https://your-actual-vercel-url.vercel.app/api/drive/callback`

#### Security
- [ ] `INTERNAL_SECRET=` (SAME as Railway!)

### Step 5: Redeploy After Env Vars
- [ ] Deployments tab → Click "Redeploy" on latest
- [ ] Wait for build to complete
- [ ] Check deployment logs - no errors
- [ ] Note your actual Vercel URL

### Step 6: Update Railway with Vercel URL
- [ ] Go back to Railway project
- [ ] Environment variables
- [ ] Update: `APP_URL=https://your-actual-vercel-url.vercel.app`
- [ ] Redeploy Railway service

### Step 7: Update Google OAuth Again
- [ ] Go to Google Cloud Console
- [ ] Update redirect URI with ACTUAL Vercel URL:
  - [ ] `https://your-actual-vercel-url.vercel.app/api/drive/callback`
- [ ] Save

### Step 8: Verify Production Deployment
- [ ] Frontend loads: `https://your-actual-vercel-url.vercel.app`
  - [ ] No errors
  - [ ] Landing page displays correctly

- [ ] AI service health: `https://your-railway-url.up.railway.app/health`
  - [ ] Returns: `{"status":"ok"}`

- [ ] Test login on production
  - [ ] Can create account
  - [ ] Can login

- [ ] Test photographer flow
  - [ ] Create event
  - [ ] Connect Google Drive (OAuth works)
  - [ ] Upload photo

- [ ] Test guest flow
  - [ ] Go to `/find`
  - [ ] Enter event code
  - [ ] Upload selfie
  - [ ] Results appear

### Step 9: Custom Domain (Optional)
- [ ] Vercel → Project Settings → Domains
- [ ] Add your domain
- [ ] Update DNS records as instructed
- [ ] Update env vars with new domain
- [ ] Update Google OAuth redirect URIs

---

## 🔍 Quick Verification Commands

### Localhost
```bash
# Check services
curl http://localhost:3000
curl http://localhost:8000/health

# Verify configuration
npm run verify

# Check processes
# Windows: tasklist | findstr node
# Windows: tasklist | findstr python
```

### Production
```bash
# Check services
curl https://your-app.vercel.app
curl https://your-railway-ai.up.railway.app/health

# Check Vercel deployment
vercel logs

# Check Railway logs
# Login to Railway dashboard → View logs
```

---

## ⚠️ Common Issues Checklist

### Localhost Issues
- [ ] Port 3000 busy? Run: `npx kill-port 3000`
- [ ] Port 8000 busy? Use different port in AI service
- [ ] Module errors? Run: `npm install` in frontend
- [ ] Python errors? Activate venv and reinstall requirements
- [ ] Database connection error? Check Supabase credentials
- [ ] AI service can't start? Check Python version (≥3.9)

### Production Issues
- [ ] "AI service unavailable"? Check Railway is running
- [ ] "Drive not connected"? Update Google OAuth redirect URI
- [ ] Build fails? Check Vercel build logs
- [ ] Images not loading? Add domain to `next.config.js`
- [ ] INTERNAL_SECRET mismatch? Must be same in Railway and Vercel
- [ ] Function timeout? May need Vercel Pro for face search (60s timeout)

---

## 📋 Environment Comparison

| Variable | Localhost | Production |
|----------|-----------|------------|
| Frontend | Port 3000 | Vercel URL |
| API | localhost:3000/api | Vercel URL/api |
| AI Service | Port 8000 | Railway URL |
| Database | Supabase URL | Same Supabase URL |
| Storage | Cloudinary | Same Cloudinary |

---

## ✅ Final Checklist

### Development Ready
- [ ] All localhost checks passed
- [ ] Services running without errors
- [ ] Can create accounts and events
- [ ] Face search works locally

### Production Ready
- [ ] Railway AI service deployed and healthy
- [ ] Vercel frontend deployed
- [ ] All env vars configured correctly
- [ ] URLs updated in all services
- [ ] Google OAuth configured for production
- [ ] Full flow tested on production
- [ ] No errors in logs

### Documentation
- [ ] Team has access to SETUP_GUIDE.md
- [ ] Environment variables documented
- [ ] Deployment process documented
- [ ] Troubleshooting steps documented

---

## 🎯 Success Criteria

Your setup is complete when:

✅ **Localhost:**
- Frontend loads at http://localhost:3000
- AI health check returns OK
- Can create photographer account
- Can upload photos
- Face search returns results

✅ **Production:**
- Frontend loads at your Vercel URL
- AI health check returns OK from Railway
- Full photographer workflow works
- Full guest workflow works
- No errors in browser console
- No errors in deployment logs

---

## 📚 Reference Documents

After completing this checklist, refer to:

1. **SETUP_GUIDE.md** - Detailed setup instructions
2. **ENV_REFERENCE.md** - Complete environment variables list
3. **DEPLOY.md** - Deployment guide with troubleshooting
4. **DOCUMENTATION.md** - API and features documentation
5. **README.md** - Quick start and overview

---

**Last Updated:** 2024
