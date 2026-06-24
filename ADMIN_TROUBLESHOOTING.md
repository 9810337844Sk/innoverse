# Admin Dashboard Troubleshooting Guide

Agar admin dashboard mein users update nahi ho rahe ya demo data aa raha hai, to yeh steps follow karein:

---

## 🔍 Step 1: Check Supabase Connection

### Test API Endpoint
```
http://localhost:3000/api/test-supabase
```

Yeh endpoint check karega:
- ✓ Environment variables set hain ya nahi
- ✓ Supabase connection kaam kar raha hai
- ✓ Users table se data fetch ho raha hai

**Expected Response:**
```json
{
  "success": true,
  "userCount": 5,
  "sampleUsers": [...],
  "message": "Supabase connection working!"
}
```

**If Failed:**
- Check `.env.local` file exists in `frontend` folder
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set
- Restart Next.js dev server after changing env vars

---

## 🗄️ Step 2: Verify Supabase Database

### Check Users Table

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **Table Editor** → **users**
4. Verify:
   - ✓ Table exists
   - ✓ Has data (users visible)
   - ✓ Columns: `id`, `name`, `email`, `role`, `banned`, `plan`, `created_at`

### Required Columns in Users Table:
```sql
- id (uuid, primary key)
- name (text)
- email (text, unique)
- password_hash (text)
- role (text) - values: 'photographer', 'admin'
- banned (boolean, default false)
- plan (text, default 'free') - values: 'free', 'pro', 'studio'
- avatar (text, nullable)
- created_at (timestamptz, default now())
```

### If No Users Exist:

Add a test admin user:
```sql
INSERT INTO users (id, name, email, password_hash, role, banned, plan)
VALUES (
  gen_random_uuid(),
  'Test Admin',
  'admin@test.com',
  hash_password('admin123'), -- Use your hash_password function
  'admin',
  false,
  'free'
);
```

Or manually in Supabase dashboard:
1. Table Editor → users → Insert row
2. Fill in required fields
3. Set `role` = `admin`
4. Click Save

---

## 🔐 Step 3: Check Authentication

### Verify Admin Login

1. Go to: http://localhost:3000/admin/login
2. Login with admin credentials
3. Check browser console (F12) for errors
4. Check Network tab for API calls

### Check Session Cookie

After login, verify cookie is set:
1. Open DevTools (F12)
2. Go to Application → Cookies
3. Look for `auth-token` cookie
4. Should contain JWT token

---

## 🔧 Step 4: Check Environment Variables

### Verify `.env.local` in `frontend` folder:

```bash
# Check file exists
cd frontend
dir .env.local

# Or on Windows PowerShell
Test-Path .env.local
```

### Required Variables:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Get Service Role Key:
1. Supabase Dashboard → Project Settings
2. API Settings
3. Copy "service_role" key (NOT anon key!)

---

## 📊 Step 5: Check API Routes

### Test Admin APIs Directly:

**1. Test Supabase Connection:**
```
GET http://localhost:3000/api/test-supabase
```

**2. Test Admin Users:**
```
GET http://localhost:3000/api/admin/users
```

**3. Test Admin Stats:**
```
GET http://localhost:3000/api/admin/stats
```

### Check Server Console Logs:

Terminal where `npm run dev` is running should show:
```
=== GET /api/admin/users START ===
Environment check:
- Supabase URL: ✓
- Service Key: ✓
User from request: { id: '...', role: 'admin', name: '...' }
Querying Supabase users table...
✓ Successfully fetched 5 users (total count: 5)
=== GET /api/admin/users END ===
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "Forbidden" Error (403)

**Cause:** Not logged in as admin or invalid session

**Solution:**
1. Logout: http://localhost:3000/api/auth/logout
2. Login again as admin
3. Check user role is `admin` in database

### Issue 2: "Missing Supabase env vars"

**Cause:** Environment variables not loaded

**Solution:**
1. Verify `.env.local` exists in `frontend` folder
2. Check variables are correctly set
3. **Restart dev server:** `Ctrl+C` and `npm run dev`
4. Clear Next.js cache: Delete `.next` folder

### Issue 3: Empty Users Array

**Cause:** No users in Supabase database

**Solution:**
1. Check Supabase → Table Editor → users
2. Add at least one admin user (see Step 2)
3. Refresh admin page

### Issue 4: "Demo Users" Still Showing

**Cause:** Frontend cached or API not called

**Solution:**
1. Hard refresh browser: `Ctrl+Shift+R`
2. Clear browser cache
3. Check Network tab - is `/api/admin/users` being called?
4. Check console logs for errors

### Issue 5: API Returns 500 Error

**Cause:** Database query error or missing columns

**Solution:**
1. Check server console for detailed error
2. Verify all required columns exist in users table
3. Check Supabase logs in dashboard
4. Ensure schema matches (run `supabase_schema.sql`)

---

## 🔄 Step 6: Restart Everything

If nothing works, complete restart:

```bash
# 1. Stop Next.js dev server (Ctrl+C)

# 2. Clear Next.js cache
cd frontend
rmdir /s /q .next

# 3. Verify environment variables
type .env.local | findstr SUPABASE

# 4. Restart dev server
npm run dev

# 5. Open browser in incognito/private mode
# Visit: http://localhost:3000/admin/login
```

---

## 📝 Debugging Checklist

Before asking for help, verify:

- [ ] Supabase project is active (not paused)
- [ ] Users table exists and has data
- [ ] `.env.local` file exists with correct credentials
- [ ] Service Role Key is correct (not anon key)
- [ ] Next.js dev server restarted after env changes
- [ ] Logged in as admin user (role = 'admin')
- [ ] Browser cache cleared / using incognito mode
- [ ] No errors in browser console (F12)
- [ ] No errors in server terminal logs
- [ ] `/api/test-supabase` returns success

---

## 🔍 Check Logs

### Browser Console Logs:
```
F12 → Console tab
Look for:
- Fetching users from /api/admin/users...
- Response received: { users: [...] }
- Users count: 5
```

### Server Console Logs:
```
Terminal running npm run dev
Look for:
- === GET /api/admin/users START ===
- ✓ Successfully fetched X users
- === GET /api/admin/users END ===
```

### Supabase Logs:
1. Supabase Dashboard → Logs
2. Filter by: API requests
3. Look for SELECT queries on users table

---

## ✅ Success Indicators

Your setup is working when:

1. ✅ `/api/test-supabase` returns success
2. ✅ Server logs show "Successfully fetched X users"
3. ✅ Admin dashboard shows real users from database
4. ✅ User count matches Supabase table count
5. ✅ Can edit/ban/delete users and changes reflect in Supabase

---

## 🆘 Still Not Working?

1. **Check server console** for detailed error messages
2. **Check browser console** for API errors
3. **Verify Supabase credentials** are correct
4. **Test API directly** using Postman or browser
5. **Check network tab** to see actual API responses

### Provide This Info for Help:

- [ ] Output of `/api/test-supabase`
- [ ] Server console logs
- [ ] Browser console errors
- [ ] Network tab response for `/api/admin/users`
- [ ] Supabase users table screenshot
- [ ] Environment variables (hide sensitive parts)

---

## 🎯 Quick Fix Commands

```powershell
# Check environment
cd frontend
Get-Content .env.local | Select-String "SUPABASE"

# Clear cache and restart
Remove-Item -Recurse -Force .next
npm run dev

# Test API
curl http://localhost:3000/api/test-supabase
curl http://localhost:3000/api/admin/users
```

---

**Last Updated:** 2024
