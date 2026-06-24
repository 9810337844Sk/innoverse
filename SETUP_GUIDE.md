# PhotoFly Setup Guide
## Complete Setup for Localhost & Production

Is guide mein aap seekhenge ki kaise PhotoFly platform ko:
- **Local development** (localhost) par run karen
- **Production deployment** (Vercel + Railway) par deploy karen

---

## 📋 Prerequisites

### Required Software
- **Node.js** (v18 or higher)
- **Python** (v3.9 or higher)
- **Git**
- **npm** or **yarn**

### Required Accounts (Free tier available for all)
- **Supabase** - Database
- **Cloudinary** - Photo storage
- **Google Cloud** - Drive integration
- **Vercel** - Frontend hosting (production)
- **Railway** - AI service hosting (production)

---

## 🚀 Part 1: Local Development Setup

### Step 1: Clone and Install

```bash
# Clone repository
git clone <your-repo-url>
cd photo-event-platform

# Install frontend dependencies
cd frontend
npm install

# Go back to root
cd ..
```

### Step 2: Setup Supabase Database

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Note your **Project URL** and **Service Role Key**

2. **Setup Database Schema**
   - Go to **SQL Editor** → **New Query**
   - Copy entire contents of `supabase_schema.sql`
   - Paste and click **Run**

3. **Verify Tables Created**
   - Go to **Table Editor**
   - You should see: `users`, `events`, `photos`, `search_logs`, `payments`

### Step 3: Setup Cloudinary

1. Go to [cloudinary.com](https://cloudinary.com)
2. Create free account
3. Go to **Dashboard**
4. Note these values:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

### Step 4: Setup Google Drive Integration

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project
3. Enable **Google Drive API**
4. Go to **Credentials** → **Create OAuth 2.0 Client ID**
5. Select **Web Application**
6. Add Authorized Redirect URI:
   ```
   http://localhost:3000/api/drive/callback
   ```
7. Note your **Client ID** and **Client Secret**

### Step 5: Configure Frontend Environment

```bash
cd frontend

# Copy example env file
cp .env.local.example .env.local

# Edit .env.local with your values
```

**Edit `frontend/.env.local`:**

```env
# Use localhost URLs (already configured for local dev)
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_AI_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Add your Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Generate AUTH_SECRET
# Run: openssl rand -base64 32
AUTH_SECRET=your_generated_secret_here

# Add your Cloudinary credentials
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Add your Google credentials
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/drive/callback

# Internal secret (any random string)
INTERNAL_SECRET=my-local-dev-secret-123
```

### Step 6: Configure AI Service

```bash
cd ../ai-service

# Copy example env file
cp .env.example .env

# Edit .env with your values
```

**Edit `ai-service/.env`:**

```env
# Localhost configuration
APP_URL=http://localhost:3000

# Same secret as frontend
INTERNAL_SECRET=my-local-dev-secret-123
```

### Step 7: Install Python Dependencies

```bash
# Make sure you're in ai-service folder
cd ai-service

# Create virtual environment (recommended)
python -m venv .venv

# Activate virtual environment
# Windows:
.venv\Scripts\activate
# Mac/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Step 8: Start All Services

**Option A: Start services individually in separate terminals**

```bash
# Terminal 1 - Frontend
cd frontend
npm run dev
# Frontend will run on http://localhost:3000

# Terminal 2 - AI Service
cd ai-service
# Activate venv first if not already activated
# Windows: .venv\Scripts\activate
# Mac/Linux: source .venv/bin/activate
uvicorn main:app --reload --port 8000
# AI service will run on http://localhost:8000
```

**Option B: Use PM2 (if installed)**

```bash
# Install PM2 globally (one time)
npm install -g pm2

# From project root
pm2 start frontend/package.json --name frontend
pm2 start "uvicorn main:app --reload --port 8000" --name ai-service --interpreter python
```

### Step 9: Verify Setup

Open your browser and check:

1. **Frontend**: http://localhost:3000
   - Landing page should load

2. **AI Service Health**: http://localhost:8000/health
   - Should show: `{"status":"ok"}`

3. **Test Login**:
   - Go to http://localhost:3000/auth/login
   - Try creating an account

---

## 🌐 Part 2: Production Deployment

### Step 1: Setup AI Service on Railway

1. **Deploy AI Service First**
   - Go to [railway.app](https://railway.app)
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Set **Root Directory** to `ai-service`

2. **Configure Environment Variables in Railway**
   ```
   APP_URL=https://your-app.vercel.app  (you'll update this later)
   INTERNAL_SECRET=generate-a-long-random-string-here
   ```

3. **Note the Railway URL**
   - After deployment, copy the generated URL
   - Example: `https://photofly-ai.up.railway.app`

### Step 2: Deploy Frontend to Vercel

1. **Push Code to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Import Project to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Set **Root Directory** to `frontend`
   - Framework Preset: **Next.js** (auto-detected)

3. **Configure Environment Variables in Vercel**
   - Go to Project Settings → Environment Variables
   - Add all these (replace with your actual values):

   ```
   # App URLs (UPDATE WITH YOUR VERCEL URL)
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   NEXT_PUBLIC_API_URL=https://your-app.vercel.app/api
   NEXT_PUBLIC_AI_URL=https://your-railway-ai.up.railway.app
   AI_SERVICE_URL=https://your-railway-ai.up.railway.app

   # Supabase (same as local)
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

   # Auth (generate new one for production)
   AUTH_SECRET=run_openssl_rand_base64_32

   # Cloudinary (same as local)
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

   # Google Drive (UPDATE REDIRECT URI)
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   GOOGLE_REDIRECT_URI=https://your-app.vercel.app/api/drive/callback

   # Internal Secret (MUST MATCH RAILWAY)
   INTERNAL_SECRET=same-secret-as-railway
   ```

4. **Update Google OAuth Redirect URI**
   - Go to [console.cloud.google.com](https://console.cloud.google.com)
   - Go to your project → Credentials → OAuth 2.0 Client
   - Add production redirect URI:
     ```
     https://your-app.vercel.app/api/drive/callback
     ```

5. **Redeploy**
   - After setting env vars, go to Deployments
   - Click "Redeploy" on latest deployment

### Step 3: Update Railway with Vercel URL

1. Go back to Railway project
2. Update environment variable:
   ```
   APP_URL=https://your-actual-vercel-app.vercel.app
   ```
3. Redeploy the Railway service

### Step 4: Verify Production Deployment

Check these URLs:

1. **Frontend**: `https://your-app.vercel.app`
   - Landing page should load

2. **AI Service**: `https://your-railway-ai.up.railway.app/health`
   - Should return: `{"status":"ok"}`

3. **Test Full Flow**:
   - Create photographer account
   - Create event
   - Connect Google Drive
   - Upload photos
   - Try guest search

---

## 🔧 Important Configuration Notes

### API URL Configuration

**Localhost:**
- Frontend Next.js runs on port 3000
- Frontend API routes are at: `http://localhost:3000/api`
- AI service runs on: `http://localhost:8000`

**Production:**
- Frontend and API routes are both on Vercel: `https://your-app.vercel.app`
- AI service on Railway: `https://your-railway-ai.up.railway.app`

### Environment Variables Explained

| Variable | Localhost | Production |
|----------|-----------|------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3000/api` | `https://your-app.vercel.app/api` |
| `NEXT_PUBLIC_AI_URL` | `http://localhost:8000` | `https://railway-url.railway.app` |
| `APP_URL` (AI service) | `http://localhost:3000` | `https://your-app.vercel.app` |
| `GOOGLE_REDIRECT_URI` | `http://localhost:3000/api/drive/callback` | `https://your-app.vercel.app/api/drive/callback` |

### Security Best Practices

1. **Never commit `.env` files** - They contain secrets
2. **Use different secrets** for localhost vs production
3. **Rotate secrets** regularly in production
4. **Enable Supabase RLS** (Row Level Security) policies
5. **Keep `INTERNAL_SECRET`** same in frontend and AI service

---

## 🐛 Troubleshooting

### Localhost Issues

| Problem | Solution |
|---------|----------|
| Port 3000 already in use | Kill process: `npx kill-port 3000` |
| Port 8000 already in use | Kill process or use different port |
| AI service error | Check Python version (≥3.9), activate venv |
| Module not found | Run `npm install` in frontend folder |
| Database connection error | Verify Supabase credentials in `.env.local` |

### Production Issues

| Problem | Solution |
|---------|----------|
| `AI service unavailable` | Check Railway logs, verify URL in Vercel env |
| `Drive not connected` | Update redirect URI in Google Console |
| `Event not found` | Check event `is_active = true` in Supabase |
| `INTERNAL_SECRET mismatch` | Verify same value in Railway and Vercel |
| Build fails | Check Vercel build logs, verify all env vars set |
| Images not loading | Add domain to `next.config.js` remotePatterns |

### Common Errors

**Error: "Cannot connect to AI service"**
```bash
# Localhost: Check if AI service is running
curl http://localhost:8000/health

# Production: Check Railway URL
curl https://your-railway-ai.up.railway.app/health
```

**Error: "Invalid Google OAuth redirect"**
- Make sure redirect URI in Google Console matches exactly
- Includes both localhost and production URLs

**Error: "Supabase authentication failed"**
- Verify `SUPABASE_SERVICE_ROLE_KEY` is correct
- Check Supabase project is not paused

---

## 📊 Vercel Plan Requirements

| Feature | Hobby (Free) | Pro ($20/mo) |
|---------|--------------|--------------|
| Function timeout | 10 seconds | 60 seconds |
| Bandwidth | 100 GB/mo | 1 TB/mo |

⚠️ **Face search** and **Drive import** take 30-60 seconds → **Vercel Pro required**

---

## 🎯 Quick Start Checklist

### Localhost Development
- [ ] Node.js and Python installed
- [ ] Supabase project created and schema loaded
- [ ] Cloudinary account setup
- [ ] Google OAuth configured for localhost
- [ ] Frontend `.env.local` configured
- [ ] AI service `.env` configured
- [ ] Python dependencies installed
- [ ] Frontend running on localhost:3000
- [ ] AI service running on localhost:8000
- [ ] Can login and create events

### Production Deployment
- [ ] Code pushed to GitHub
- [ ] Railway project created for AI service
- [ ] Railway env vars configured
- [ ] Vercel project created for frontend
- [ ] Vercel env vars configured
- [ ] Google OAuth updated with production URL
- [ ] Railway APP_URL updated with Vercel URL
- [ ] Both services health checks passing
- [ ] Full flow tested (create event → upload → search)

---

## 🆘 Need Help?

1. Check logs:
   - **Localhost Frontend**: Terminal where `npm run dev` is running
   - **Localhost AI**: Terminal where `uvicorn` is running
   - **Production Frontend**: Vercel deployment logs
   - **Production AI**: Railway deployment logs

2. Verify environment variables match between services

3. Check DEPLOY.md for additional deployment details

4. Review DOCUMENTATION.md for API endpoints and features

---

## 🔄 Switching Between Localhost and Production

Aap easily switch kar sakte hain between environments by updating `.env` files:

### For Localhost Development
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_AI_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### For Testing Production URLs Locally
```env
NEXT_PUBLIC_API_URL=https://your-app.vercel.app/api
NEXT_PUBLIC_AI_URL=https://your-railway-ai.up.railway.app
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

**Note**: Restart frontend dev server after changing env vars!

---

## 📝 Summary

Yeh platform **tin main components** se bana hai:

1. **Frontend (Next.js)** - User interface, API routes
   - Localhost: Port 3000
   - Production: Vercel

2. **AI Service (FastAPI + DeepFace)** - Face recognition
   - Localhost: Port 8000
   - Production: Railway

3. **Database (Supabase)** - Data storage
   - Same for localhost and production

Sabhi components ko properly configure karen environment variables se, aur dono environments mein seamlessly kaam karega! 🚀
