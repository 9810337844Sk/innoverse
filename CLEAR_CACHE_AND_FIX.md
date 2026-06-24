# Sarah Williams Nahi Hat Raha? Fix Karo

## Problem
Database me update kar diya but UI me abhi bhi "Sarah Williams" dikh raha hai.

## Reason
Aapka browser **localStorage** me purana user data cached hai.

## Solution (3 Steps)

### Step 1: Logout Karo
1. Admin panel me jao
2. **"Sign out"** button click karo
3. Ya browser me console open karo (F12)
4. Console me paste karo:
```javascript
localStorage.clear();
sessionStorage.clear();
```

### Step 2: Browser Cache Clear Karo
**Chrome/Edge:**
1. Press `Ctrl + Shift + Delete`
2. Select "Cached images and files"
3. Click "Clear data"

**Ya:**
1. Press `Ctrl + Shift + R` (hard refresh)

### Step 3: Login Karo Wapas
1. Go to `/admin/login`
2. Login karo:
   - Username: `photofly9090`
   - Password: `admin@Sunway11`
3. Ab **"PhotoFly Admin"** dikhna chahiye!

---

## Agar Abhi Bhi Nahi Hata?

### Verify Database Update Hua Ya Nahi:

Go to Supabase Dashboard → Table Editor → users table

Check the admin row:
- **name** column me "PhotoFly Admin" hona chahiye
- **email** column me "sachin.it.ktm@gmail.com" hona chahiye

Agar nahi hai, to SQL run karo:

```sql
UPDATE users 
SET 
  name = 'PhotoFly Admin',
  email = 'sachin.it.ktm@gmail.com'
WHERE 
  role = 'admin';
```

---

## Quick Fix (One Command)

Browser console me (F12) ye paste karo:

```javascript
localStorage.clear();
sessionStorage.clear();
window.location.href = '/admin/login';
```

Ye automatically logout karke login page pe le jayega.
