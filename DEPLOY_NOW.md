# 🚀 Deploy to Vercel - Quick Guide

## ✅ Prerequisites Check

Before deploying, make sure:

- [x] Code changes are saved
- [x] Supabase database is updated (PhotoFly Admin)
- [x] All environment variables are set in Vercel dashboard

---

## 🎯 Option 1: Auto Deploy (Recommended)

Vercel automatically deploys when you push to GitHub.

### Steps:

```bash
# 1. Navigate to project root
cd "c:\Users\Sachin\Desktop\Task\PhotoBhooth Personal\photo-event-platform"

# 2. Check git status
git status

# 3. Add all changes
git add .

# 4. Commit changes
git commit -m "Update: Clean branding, notification fixes, realtime updates"

# 5. Push to GitHub (this triggers Vercel deployment)
git push origin main
```

### Monitor Deployment:
1. Go to: https://vercel.com/dashboard
2. You'll see deployment progress
3. Wait 2-3 minutes for build to complete
4. Click the deployment URL to test

---

## 🎯 Option 2: Manual Deploy with Vercel CLI

If you want to deploy immediately without pushing to GitHub:

```bash
# 1. Navigate to frontend folder
cd frontend

# 2. Deploy to production
vercel --prod
```

This uploads directly from your local machine.

---

## 🎯 Option 3: Use the Batch Script

Double-click: `deploy-to-vercel.bat`

This will:
1. ✅ Commit your changes
2. ✅ Push to GitHub
3. ✅ Deploy to Vercel
4. ✅ Show deployment URL

---

## 🔍 Verify Deployment

After deployment completes, check:

### 1. Landing Page
Visit: `https://your-app.vercel.app`
- Should load without errors
- PhotoFly logo visible
- No console errors (F12)

### 2. Admin Panel
Visit: `https://your-app.vercel.app/admin/login`
- Login with: `photofly9090` / `admin@Sunway11`
- Should show "PhotoFly Admin" (not Sarah Williams) ✅
- Check users page works
- Check events page works
- Check dashboard stats work

### 3. Notifications
- Open admin panel
- Register a new user in another tab
- Should see notification update within 2-3 seconds ✅

### 4. API Health
Visit: `https://your-app.vercel.app/api/health`
- Should return: `{"status":"ok"}`

---

## ⚙️ Environment Variables (Required)

Make sure these are set in Vercel Dashboard:

### Vercel Dashboard → Project → Settings → Environment Variables

#### Critical (Required):
```
NEXT_PUBLIC_SUPABASE_URL         = https://pslgosbr.supabase.co
SUPABASE_SERVICE_ROLE_KEY        = eyJhbGci...
NEXT_PUBLIC_SUPABASE_ANON_KEY    = eyJhbGci...
AUTH_SECRET                       = (generate: openssl rand -base64 32)
NEXT_PUBLIC_APP_URL              = https://your-app.vercel.app
NEXT_PUBLIC_API_URL              = https://your-app.vercel.app/api
```

#### For Email (Registration):
```
SMTP_HOST     = smtp.gmail.com
SMTP_PORT     = 587
SMTP_SECURE   = false
SMTP_USER     = your@gmail.com
SMTP_PASS     = your_app_password
SMTP_FROM     = PhotoFly <your@gmail.com>
```

#### For AI Service (Optional):
```
AI_SERVICE_URL    = https://your-railway-url.railway.app
INTERNAL_SECRET   = your-secret-key
```

#### For Cloudinary (Photo Upload):
```
CLOUDINARY_CLOUD_NAME  = your_cloud_name
CLOUDINARY_API_KEY     = your_api_key
CLOUDINARY_API_SECRET  = your_secret
```

---

## 🐛 Troubleshooting

### Build Fails
```bash
# Clear cache and rebuild
cd frontend
rm -rf .next node_modules
npm install
npm run build
```

### Environment Variables Not Working
1. Go to Vercel Dashboard → Settings → Environment Variables
2. Check all required variables are set
3. Click "Redeploy" (Deployments tab → ... menu → Redeploy)

### Still Shows Old Data (Sarah Williams)
1. Clear browser cache: Ctrl + Shift + Delete
2. Logout and login again
3. Check Supabase database was updated

### API Errors (500)
1. Check Vercel Function Logs: Dashboard → Functions → Select function → Logs
2. Check Supabase connection: Test with SQL query
3. Verify SUPABASE_SERVICE_ROLE_KEY is correct

---

## 📊 Deployment Status

After deploying, check:

- ✅ Build succeeded (green checkmark in Vercel)
- ✅ No build errors in logs
- ✅ Environment variables set
- ✅ App loads at deployment URL
- ✅ Admin panel works
- ✅ Database connection works
- ✅ Notifications update (test with new user registration)

---

## 🎉 Success!

Once deployed:
1. Share the Vercel URL: `https://your-app.vercel.app`
2. Test all features
3. Monitor Vercel logs for any errors
4. Update Supabase RLS policies if needed

---

## 🔗 Quick Links

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Supabase Dashboard**: https://supabase.com/dashboard
- **Deployment Docs**: See `DEPLOY.md` for full guide
