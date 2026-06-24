-- ============================================================
-- Enable Supabase Realtime for Users Table
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Enable realtime for users table
ALTER PUBLICATION supabase_realtime ADD TABLE users;

-- Verify realtime is enabled
SELECT 
  schemaname, 
  tablename, 
  pubname
FROM 
  pg_publication_tables 
WHERE 
  pubname = 'supabase_realtime';

-- You should see:
-- public | users | supabase_realtime

-- That's it! Realtime is now enabled.
-- The admin panel will now receive instant notifications (<100ms) when:
-- - New user registers (INSERT)
-- - User is updated (UPDATE) - role, plan, banned status
-- - User is deleted (DELETE)
