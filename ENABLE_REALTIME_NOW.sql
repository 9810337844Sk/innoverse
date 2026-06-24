-- ============================================================
-- CRITICAL: Enable Supabase Realtime for Instant Notifications
-- ============================================================
-- This SQL MUST be run in Supabase Dashboard to enable instant
-- notifications (<100ms) in the admin panel.
--
-- WHERE TO RUN:
-- 1. Go to: https://supabase.com/dashboard
-- 2. Select your project
-- 3. Click: SQL Editor (left sidebar)
-- 4. Click: New Query
-- 5. Paste this entire file
-- 6. Click: Run (or press Ctrl+Enter)
-- ============================================================

-- Enable realtime for users table (instant user registration notifications)
ALTER PUBLICATION supabase_realtime ADD TABLE users;

-- Enable realtime for events table (instant event creation notifications)  
ALTER PUBLICATION supabase_realtime ADD TABLE events;

-- Enable realtime for photos table (instant photo upload notifications - optional)
ALTER PUBLICATION supabase_realtime ADD TABLE photos;

-- ============================================================
-- VERIFY IT WORKED
-- ============================================================
-- Run this query to confirm realtime is enabled:
SELECT 
  schemaname AS schema,
  tablename AS table_name,
  pubname AS publication
FROM 
  pg_publication_tables 
WHERE 
  pubname = 'supabase_realtime'
  AND tablename IN ('users', 'events', 'photos')
ORDER BY
  tablename;

-- ============================================================
-- EXPECTED OUTPUT:
-- ============================================================
--  schema | table_name | publication
-- --------+------------+------------------
--  public | events     | supabase_realtime
--  public | photos     | supabase_realtime
--  public | users      | supabase_realtime
--
-- If you see these 3 rows, realtime is enabled! ✅
-- ============================================================

-- ============================================================
-- WHAT THIS DOES:
-- ============================================================
-- After running this SQL, the admin panel will:
-- 
-- 1. Receive instant notifications when:
--    - New user registers (INSERT on users)
--    - User is updated (UPDATE on users - banned status, role, plan)
--    - User is deleted (DELETE on users)
--    - New event is created (INSERT on events)
--    - Event is updated (UPDATE on events - active status)
--    - Photos are uploaded (INSERT on photos)
--
-- 2. Update speeds:
--    - WITH Realtime: 50-100ms (near-instant) ✅
--    - WITHOUT Realtime: 2-3 seconds (polling only) ❌
--
-- 3. Browser console will show:
--    🔴 Supabase Realtime: Connecting...
--    🔴 Supabase Realtime status: SUBSCRIBED
--    🔴 Supabase Realtime: User change detected! INSERT
--
-- ============================================================
-- TROUBLESHOOTING:
-- ============================================================
-- If verification query returns 0 rows:
-- 1. Make sure you're in the correct Supabase project
-- 2. Check if tables exist: SELECT tablename FROM pg_tables WHERE schemaname = 'public';
-- 3. Try running the ALTER PUBLICATION commands one by one
-- 4. Refresh the Supabase dashboard page
-- 5. Check for error messages in SQL Editor output
--
-- If admin panel still doesn't update instantly:
-- 1. Verify .env.local has NEXT_PUBLIC_SUPABASE_ANON_KEY
-- 2. Restart Next.js dev server: npm run dev
-- 3. Clear browser cache and hard reload (Ctrl+Shift+R)
-- 4. Open browser console (F12) and look for realtime connection logs
-- 5. Test with /test-notification page to debug
-- ============================================================

-- Additional diagnostic query - check all realtime-enabled tables
SELECT 
  schemaname,
  tablename,
  pubname
FROM 
  pg_publication_tables 
WHERE 
  pubname = 'supabase_realtime'
ORDER BY 
  schemaname, tablename;

-- Check if realtime publication exists at all
SELECT * FROM pg_publication WHERE pubname = 'supabase_realtime';
