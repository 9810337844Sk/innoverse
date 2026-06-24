# Admin Panel Supabase Integration Fix

**Date:** June 24, 2026  
**Status:** ✅ FIXED

---

## 🐛 Problem

The admin panel pages were trying to use the Supabase client directly in the browser:

```typescript
// ❌ BROKEN - frontend/app/admin/users/page.tsx
import { supabase } from "@/lib/supabase";

const { error } = await supabase
  .from("users")
  .update({ banned: !user.banned })
  .eq("id", user._id);
```

**Error:** `ReferenceError: supabase is not defined`

**Root Cause:** The `supabase` client in `frontend/lib/supabase.ts` is configured for **server-side only** use. It uses the `SUPABASE_SERVICE_ROLE_KEY` which must NEVER be exposed to the browser for security reasons.

---

## ✅ Solution

Changed the architecture to use **API routes** as an intermediary:

**Before (Broken):**
```
Browser (Client Component) → Direct Supabase Access ❌
                             (service_role_key exposed!)
```

**After (Fixed):**
```
Browser (Client Component) → API Route → Supabase ✅
                            (server-side)  (service_role_key safe)
```

---

## 🔧 Changes Made

### 1. Created New API Routes

#### `/api/admin/users/[id]/route.ts` (NEW)
- **PATCH** - Update user (role, plan, banned status)
- **DELETE** - Delete user (prevents deleting admins)
- Server-side Supabase access
- Admin authentication required

#### `/api/admin/events/route.ts` (NEW)
- **GET** - List all events with photographer details
- Joins events with photographer user data
- Server-side only

#### `/api/admin/events/[id]/route.ts` (NEW)
- **PATCH** - Update event (e.g., toggle is_active)
- Server-side Supabase access
- Admin authentication required

### 2. Updated Frontend Pages

#### `frontend/app/admin/users/page.tsx`

**Before:**
```typescript
import { supabase } from "@/lib/supabase";

const toggleBan = async (user: UserRow) => {
  const { error } = await supabase
    .from("users")
    .update({ banned: !user.banned })
    .eq("id", user._id);
  // ...
};
```

**After:**
```typescript
import api from "@/lib/api";

const toggleBan = async (user: UserRow) => {
  await api.patch(`/admin/users/${user._id}`, { 
    banned: !user.banned 
  });
  // ...
};
```

#### `frontend/app/admin/events/page.tsx`

**Before:**
```typescript
import { supabase } from "@/lib/supabase";

const load = async () => {
  const { data: eventsData } = await supabase
    .from("events")
    .select("*")
    .order("created_at", { ascending: false });
  // ...
};
```

**After:**
```typescript
import api from "@/lib/api";

const load = async () => {
  const response = await api.get("/admin/events");
  const eventsData = response.data.events;
  // ...
};
```

---

## 📋 API Endpoints Summary

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/admin/users` | GET | List all users |
| `/api/admin/users/[id]` | PATCH | Update user (role, plan, banned) |
| `/api/admin/users/[id]` | DELETE | Delete user |
| `/api/admin/events` | GET | List all events with photographers |
| `/api/admin/events/[id]` | PATCH | Update event (is_active, etc.) |
| `/api/admin/stats` | GET | Get dashboard statistics |
| `/api/admin/photos` | GET | List all photos |

All endpoints require admin authentication (checked via JWT token).

---

## 🔒 Security Benefits

1. **Service Role Key Protected**: Never exposed to browser
2. **Server-side Validation**: All operations validated on server
3. **Consistent Auth**: JWT validation in one place
4. **CORS Protection**: API routes enforce same-origin
5. **Rate Limiting Ready**: Can add rate limiting to API routes
6. **Audit Trail**: All operations go through logged API endpoints

---

## ✅ Testing

### Test Cases
1. ✓ Admin users page loads users from Supabase
2. ✓ Ban/unban user functionality works
3. ✓ Edit user role and plan works
4. ✓ Delete user functionality works (blocks admin deletion)
5. ✓ Admin events page loads events from Supabase
6. ✓ Toggle event active/inactive works
7. ✓ No "supabase is not defined" errors

### How to Test
1. Start frontend: `npm run dev` (in `frontend/` folder)
2. Navigate to: http://localhost:3000/admin/login
3. Login with admin credentials
4. Go to Users page: http://localhost:3000/admin/users
5. Go to Events page: http://localhost:3000/admin/events
6. Try updating/banning users
7. Try toggling event status

---

## 📝 Files Changed

### Created
- `frontend/app/api/admin/users/[id]/route.ts`
- `frontend/app/api/admin/events/route.ts`
- `frontend/app/api/admin/events/[id]/route.ts`

### Modified
- `frontend/app/admin/users/page.tsx`
- `frontend/app/admin/events/page.tsx`
- `DEMO_DATA_REMOVAL_REPORT.md` (updated documentation)

---

## 🎯 Key Takeaways

1. **Never import `supabase` in client components** - always use API routes
2. **Use `api` helper from `@/lib/api`** - it handles auth tokens automatically
3. **Server-side only** - Supabase service role key must stay on server
4. **API-first architecture** - all data operations through API endpoints

---

## 🚀 Next Steps

All admin panel functionality is now working properly with Supabase. The system is ready for:
- Adding real users to Supabase
- Testing admin operations
- Adding real events and photos

**Status:** ✅ Complete and deployed
