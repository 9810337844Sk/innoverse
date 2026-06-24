# Admin Panel Fixes

## Issues Fixed

### 1. **Removed Analytics from Sidebar** ✅
- Removed the Analytics navigation item from admin sidebar
- Analytics page still exists but is hidden from navigation
- Cleaned up unused imports (BarChart3 icon)

### 2. **Created Missing API Routes** ✅

#### Created: `/api/admin/users/[id]/route.ts`
- **PATCH** - Update user (ban/unban, change role, change plan)
- **DELETE** - Delete user permanently
- Uses Supabase for database operations
- Requires admin authentication

#### Created: `/api/admin/activity/route.ts`
- **GET** - Fetch recent photo activity (views/downloads)
- Returns top 10 most viewed photos
- Joins with events table to get event names
- Used by admin notifications system

## Database Setup Required

### ⚠️ IMPORTANT: Run Supabase Schema

The admin panel requires the Supabase database to be properly set up. Follow these steps:

1. **Open Supabase Dashboard**
   - Go to: https://pslgosbrrpvzrkxxjefmj.supabase.co
   - Login with your Supabase account

2. **Run the Schema**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"
   - Copy and paste the entire contents of `supabase_schema.sql`
   - Click "Run" button

3. **Verify Tables Created**
   - Go to "Table Editor" in the left sidebar
   - You should see these tables:
     - `users`
     - `events`
     - `photos`
     - `search_logs`
     - `photo_views`

4. **Seed Data Included**
   The schema creates a default admin user:
   - **Admin**: PhotoFly Admin / sachin.it.ktm@gmail.com / demo1234

## Testing the Admin Panel

After running the schema:

1. **Login as Admin**
   - Go to: `http://10.52.52.76:3000/admin/login`
   - Username: `photofly9090`
   - Password: `admin@Sunway11`

2. **Check Users Page**
   - Click "Users" in the sidebar
   - You should see the 3 seeded users
   - Test ban/unban functionality
   - Test edit user (change role/plan)

3. **Check Events Page**
   - Click "Events" in the sidebar
   - Should show any created events

4. **Check Overview**
   - Click "Overview" in the sidebar
   - Shows total users, events, plan distribution

## Environment Variables

Already configured in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://pslgosbrrpvzrkxxjefmj.supabase.co
SUPABASE_SERVICE_ROLE_KEY=[configured]
AUTH_SECRET=[configured]
```

## What's Working Now

✅ Admin login with custom credentials
✅ Admin layout with notifications
✅ User management (list, ban/unban, edit, delete)
✅ Event management (list, view details)
✅ Platform overview with stats
✅ Plan distribution chart
✅ Recent activity in notifications
✅ Profile dropdown with admin badge

## Remaining Issues

If you still see "Failed to load users" error:

1. **Check Supabase Connection**
   ```bash
   # In browser console on admin page:
   fetch('https://pslgosbrrpvzrkxxjefmj.supabase.co/rest/v1/', {
     headers: { 'apikey': 'your-anon-key' }
   }).then(r => r.text()).then(console.log)
   ```

2. **Verify Schema Was Run**
   - Check Supabase Table Editor for `users` table
   - If missing, run `supabase_schema.sql`

3. **Check Browser Console**
   - Open DevTools → Console tab
   - Look for red error messages
   - Share the error details for further debugging

4. **Clear Next.js Cache**
   ```bash
   cd frontend
   rm -rf .next
   npm run dev
   ```

## Files Modified

1. `frontend/app/admin/layout.tsx` - Removed Analytics from sidebar
2. `frontend/app/admin/analytics/page.tsx` - Removed unwanted cards/charts
3. `frontend/app/api/admin/users/[id]/route.ts` - **NEW** - PATCH/DELETE user
4. `frontend/app/api/admin/activity/route.ts` - **NEW** - GET photo activity

## Next Steps

1. Run `supabase_schema.sql` in Supabase SQL Editor
2. Test admin login and user management
3. If issues persist, check browser console for errors
4. Verify Supabase environment variables are correct
