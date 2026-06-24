# Environment Variables Reference

Quick reference for all environment variables needed for PhotoFly platform.

---

## 🔧 Frontend (.env.local)

### Required for Both Localhost & Production

```env
# Supabase Database
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...

# Authentication
AUTH_SECRET=generate_with_openssl_rand_base64_32

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Google Drive
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx

# Internal Security (must match AI service)
INTERNAL_SECRET=same-random-string-as-ai-service
```

### Environment-Specific URLs

**For Localhost Development:**
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_AI_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000
AI_SERVICE_URL=http://localhost:8000
GOOGLE_REDIRECT_URI=http://localhost:3000/api/drive/callback
```

**For Production (Vercel):**
```env
NEXT_PUBLIC_API_URL=https://your-app.vercel.app/api
NEXT_PUBLIC_AI_URL=https://your-railway-ai.up.railway.app
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
AI_SERVICE_URL=https://your-railway-ai.up.railway.app
GOOGLE_REDIRECT_URI=https://your-app.vercel.app/api/drive/callback
```

### Optional (Email Notifications)
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your@gmail.com
SMTP_PASS=your_gmail_app_password
SMTP_FROM=PhotoFly <your@gmail.com>
```

---

## 🤖 AI Service (.env)

### Required for Both Localhost & Production

```env
# Shared secret (must match frontend)
INTERNAL_SECRET=same-random-string-as-frontend
```

### Environment-Specific

**For Localhost Development:**
```env
APP_URL=http://localhost:3000
```

**For Production (Railway):**
```env
APP_URL=https://your-app.vercel.app
```

---

## 🔐 How to Get Each Credential

### Supabase
1. Go to [supabase.com](https://supabase.com) → New Project
2. Settings → API
3. Copy **Project URL** and **Service Role Key**

### Cloudinary
1. Go to [cloudinary.com](https://cloudinary.com) → Sign up
2. Dashboard shows: **Cloud Name**, **API Key**, **API Secret**

### Google OAuth
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create project → Enable Google Drive API
3. Credentials → Create OAuth 2.0 Client ID
4. Add redirect URIs (both localhost and production)
5. Copy **Client ID** and **Client Secret**

### AUTH_SECRET
```bash
# Generate random secret
openssl rand -base64 32
```

### INTERNAL_SECRET
- Any random string
- Must be **exactly same** in frontend and AI service
- Example: `my-super-secret-key-12345`

---

## 🌍 URL Mapping

| Service | Localhost | Production |
|---------|-----------|------------|
| **Frontend** | `http://localhost:3000` | `https://your-app.vercel.app` |
| **API Routes** | `http://localhost:3000/api` | `https://your-app.vercel.app/api` |
| **AI Service** | `http://localhost:8000` | `https://your-railway-ai.up.railway.app` |
| **Database** | `https://xxxxx.supabase.co` | `https://xxxxx.supabase.co` (same) |

---

## ✅ Validation Checklist

Before starting the app, verify:

### Frontend
- [ ] All required env vars are set in `.env.local`
- [ ] URLs match your environment (localhost vs production)
- [ ] `INTERNAL_SECRET` matches AI service
- [ ] Google redirect URI matches current environment
- [ ] Supabase credentials are correct

### AI Service
- [ ] `.env` file exists in `ai-service` folder
- [ ] `APP_URL` points to frontend URL
- [ ] `INTERNAL_SECRET` matches frontend

### Google OAuth
- [ ] Redirect URIs include both localhost and production
- [ ] Google Drive API is enabled
- [ ] OAuth consent screen is configured

### Vercel (Production only)
- [ ] All env vars set in Vercel project settings
- [ ] Values match production URLs (not localhost)
- [ ] `AI_SERVICE_URL` is set (internal, not public)

### Railway (Production only)
- [ ] Environment variables set
- [ ] `APP_URL` updated with actual Vercel URL
- [ ] Health check endpoint returns OK

---

## 🚨 Common Mistakes

| Mistake | Fix |
|---------|-----|
| Using localhost URLs in production | Update all URLs to production domains |
| Mismatched `INTERNAL_SECRET` | Must be identical in frontend and AI service |
| Wrong Google redirect URI | Must exactly match current environment |
| Forgot to restart after env change | Restart dev server after editing `.env.local` |
| Using `http://` in production | Production URLs must use `https://` |
| Backend port 5000 referenced | Frontend has no separate backend; API routes are on port 3000 |

---

## 🔄 Quick Switch Commands

### Switch to Localhost
```bash
cd frontend
# Edit .env.local - set localhost URLs
npm run dev
```

### Deploy to Production
```bash
# Push to GitHub
git push origin main

# Vercel auto-deploys
# Just ensure env vars are set correctly in Vercel dashboard
```

---

## 📝 Notes

1. **NEXT_PUBLIC_*** variables are exposed to browser
2. Other variables are server-side only
3. Restart Next.js dev server after changing env vars
4. In production, redeploy after changing Vercel env vars
5. Supabase and Cloudinary can be same for localhost and production
6. Always use different `AUTH_SECRET` for production

---

## 🔗 Related Files

- `SETUP_GUIDE.md` - Complete setup instructions
- `DEPLOY.md` - Deployment guide
- `frontend/.env.local.example` - Template with all variables
- `ai-service/.env.example` - AI service template
