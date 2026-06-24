-- Run this in Supabase Dashboard → SQL Editor RIGHT NOW
-- This will change the database immediately

UPDATE users 
SET 
  name = 'PhotoFly Admin',
  email = 'sachin.it.ktm@gmail.com'
WHERE 
  role = 'admin';

-- Check result:
SELECT name, email, role FROM users WHERE role = 'admin';
