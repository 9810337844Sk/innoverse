# PhotoFly — Full Project Documentation

> AI-powered photo discovery platform for events. Guests snap a selfie, the system finds every photo of them across the entire event in under 3 seconds.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture Diagram](#2-architecture-diagram)
3. [Tech Stack](#3-tech-stack)
4. [Frontend (Next.js)](#4-frontend-nextjs)
5. [AI Service (FastAPI + Python)](#5-ai-service-fastapi--python)
6. [Backend (Express.js)](#6-backend-expressjs)
7. [Database (Supabase)](#7-database-supabase)
8. [Google Drive Integration](#8-google-drive-integration)
9. [Authentication Flow](#9-authentication-flow)
10. [Face Search Flow (End-to-End)](#10-face-search-flow-end-to-end)
11. [Face Indexing Flow](#11-face-indexing-flow)
12. [Environment Variables](#12-environment-variables)
13. [Running Locally](#13-running-locally)
14. [Database Schema](#14-database-schema)

---

## 1. Project Overview

PhotoFly lets event photographers upload photos (directly or via Google Drive) and gives guests a public URL where they can find every photo of themselves using just a selfie — no login required.

**Core roles:**
| Role | What they do |
|---|---|
| **Photographer** | Creates events, uploads/imports photos, triggers face indexing |
| **Guest** | Visits `/find`, enters event code, uploads selfie, gets matched photos |
| **Admin** | Manages all users and events via admin dashboard |

---

## 2. Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                   Browser (Guest/Photographer)          │
└────────────────────────┬────────────────────────────────┘
                         │ HTTPS
┌────────────────────────▼────────────────────────────────┐
│              Next.js 14 App (Frontend)                  │
│  • App Router  • API Routes  • Server Components        │
│  • Supabase client (service role, server-side only)     │
└──────┬──────────────────┬──────────────────┬────────────┘
       │                  │                  │
       ▼                  ▼                  ▼
  Supabase DB       AI Service          Google Drive
  (Postgres)        (FastAPI)           (OAuth2 proxy)
  users/events/     Facenet512          Drive folder scan
  photos/logs       FAISS search        image streaming
```

**Data stores used:**
- **Supabase (PostgreSQL)** — single source of truth for all data
- **Google Drive** — photo storage (files stay in Drive, never re-uploaded)
- **Cloudinary** — optional; used only for direct file uploads (not Drive imports)

---

## 3. Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| Next.js | 14.2.3 | React framework, App Router, API routes |
| React | 18 | UI library |
| TypeScript | 5 | Type safety |
| Tailwind CSS | 3 | Utility-first styling |
| Framer Motion | 11 | Animations and transitions |
| Zustand | 4.5 | Client-side state management |
| @supabase/supabase-js | 2.106 | Database + auth client |
| googleapis | 171 | Google Drive API |
| face-api.js | 0.22 | Browser-side face detection fallback |
| react-webcam | 7.2 | In-browser selfie capture |
| react-dropzone | 14.2 | Drag-and-drop file uploads |
| react-hot-toast | 2.4 | Toast notifications |
| recharts | 2.12 | Dashboard analytics charts |
| qrcode.react | 3.1 | Event QR codes |
| nodemailer | 8 | Password reset / verification emails |
| lucide-react | 0.378 | Icon set |

### AI Service
| Technology | Version | Purpose |
|---|---|---|
| Python | 3.10+ | Runtime |
| FastAPI | 0.111 | REST API framework |
| uvicorn | 0.29 | ASGI server |
| DeepFace | 0.0.93 | Face detection + embedding |
| Facenet512 | — | Embedding model (512-dim vectors) |
| FAISS (faiss-cpu) | 1.8 | Vector similarity search |
| Pillow | 10.3 | Image loading/conversion |
| OpenCV (headless) | 4.9 | Image pre-processing |
| httpx | 0.27 | Async HTTP (callback to Next.js) |
| numpy | 1.26 | Numerical operations |

### Backend (Legacy Express — largely bypassed)
| Technology | Purpose |
|---|---|
| Node.js + Express | REST API (user auth, events, photos stubs) |
| JWT | Token-based auth |
| multer | File upload middleware |

### Database / Infrastructure
| Service | Purpose |
|---|---|
| Supabase (PostgreSQL) | Primary database + Row Level Security |
| Google Drive | Photo storage (no re-upload) |
| Cloudinary | CDN for directly-uploaded photos |

---

## 4. Frontend (Next.js)

### Directory Structure

```
frontend/
├── app/
│   ├── page.tsx                  # Landing page
│   ├── layout.tsx                # Root layout (fonts, toast, Tawk.to chat)
│   ├── globals.css               # Tailwind + custom animations
│   ├── find/page.tsx             # Guest face search (public, no login)
│   ├── auth/
│   │   ├── login/                # Login page
│   │   ├── register/             # Signup page
│   │   ├── forgot-password/      # Password reset request
│   │   └── reset-password/       # Token-based password change
│   ├── dashboard/
│   │   ├── page.tsx              # Photographer dashboard (stats, events list)
│   │   ├── events/[id]/page.tsx  # Event detail: upload, Drive sync, index faces
│   │   └── notifications/        # Notification center
│   └── api/                      # Next.js API routes (server-side)
│       ├── auth/                 # login, register, logout, forgot/reset-password
│       ├── events/               # CRUD for events
│       ├── photos/               # Upload, index, index-callback, public listing
│       ├── search/face/          # Guest face search → AI service
│       ├── drive/                # Drive auth, callback, scan, import, image proxy
│       ├── admin/                # Admin: users, events, stats, activity
│       └── profile/              # Avatar, password change
├── components/
│   ├── landing/                  # Hero, Features, HowItWorks, Pricing, Footer,
│   │   └── EventsStrip.tsx       # Animated marquee of event types
│   ├── layout/
│   │   ├── DashboardLayout.tsx   # Sidebar nav for authenticated users
│   │   └── OpeningAnimation.tsx  # Splash screen with logo + loading bar
│   └── ui/                       # Button, Input, Skeleton, etc.
└── lib/
    ├── supabase.ts               # Supabase client + TypeScript types
    ├── api.ts                    # HTTP wrapper (client → Next.js API routes)
    ├── serverAuth.ts             # JWT verification for API route guards
    ├── drive.ts                  # Drive folder scanning + image proxy helpers
    ├── drive-auth.ts             # Google OAuth2 client
    ├── faceRecognition.ts        # Browser face detection (face-api.js fallback)
    ├── mailer.ts                 # Nodemailer email templates
    ├── resetToken.ts             # AES-256-GCM stateless reset tokens
    └── cloudinary.ts             # Cloudinary upload helper (server-side only)
```

### Key API Routes

| Route | Method | Auth | What it does |
|---|---|---|---|
| `/api/auth/login` | POST | — | Verify password, set JWT cookie |
| `/api/auth/register` | POST | — | Create user in Supabase |
| `/api/auth/forgot-password` | POST | — | Send reset email |
| `/api/auth/reset-password` | POST | — | Verify token, update password |
| `/api/events` | GET/POST | Photographer | List / create events |
| `/api/events/[id]` | GET/PATCH/DELETE | Photographer | Single event CRUD |
| `/api/photos/[eventId]` | GET | Photographer | List photos for event |
| `/api/photos/index/[eventId]` | POST | Photographer | Queue unindexed photos → AI |
| `/api/photos/index-callback` | POST | AI secret | AI writes back faces + indexed flag |
| `/api/search/face` | POST | — (public) | Resolve event → fetch embeddings → AI search |
| `/api/drive/auth` | GET | Photographer | Start Google OAuth2 flow |
| `/api/drive/callback` | GET | — | OAuth2 callback, set drive_tokens cookie |
| `/api/drive/import` | POST | Photographer | Scan Drive folder, save photo metadata to Supabase |
| `/api/drive/image` | GET | Session or eventId | Proxy Drive image (photographer session **or** guest via stored refresh_token) |
| `/api/admin/users` | GET/PATCH/DELETE | Admin | User management |

### State Management (Zustand)

One global auth store holds the logged-in user object. All dashboard pages read from it. Login/logout clear or populate the store and update the JWT httpOnly cookie.

---

## 5. AI Service (FastAPI + Python)

### Location: `ai-service/`

### How Face Embeddings Work

1. **Input:** A JPEG/PNG image (either a selfie or an event photo)
2. **Detection:** DeepFace tries detectors in order — RetinaFace → MTCNN → OpenCV
3. **Embedding:** Facenet512 converts each detected face to a 512-dimensional float vector
4. **Normalization:** Vectors are L2-normalized so dot product = cosine similarity

### FAISS Index (per-event cache)

```
photos[event_id] → [face₀_embedding, face₁_embedding, …]
                        ↓ IndexFlatIP
cosine_similarity(selfie_embedding, all_faces) → sorted matches
```

- Cache TTL: **30 minutes** per event
- Cache invalidated after each indexing job
- Threshold: `0.6` (configurable per request)
- Max results: 50 photos

### Endpoints

#### `POST /index`
Triggered by `/api/photos/index/[eventId]` in Next.js.

```json
// Request body
{
  "event_id": "uuid",
  "photos": [{ "id": "uuid", "url": "https://googleapis.com/..." }],
  "callback_url": "http://localhost:3000/api/photos/index-callback"
}
```

Runs as a **background task**:
1. Downloads each photo from `url` (direct googleapis.com URL with `?access_token=`)
2. Calls `face_engine.extract_faces()` → gets embeddings + bounding boxes
3. Auto-tags: `portrait`, `group`, `no-face`, `bright`, `dark`
4. POSTs `{ photoId, faces, tags }` to `callback_url` with `x-internal-secret` header

#### `POST /search`
Triggered by `/api/search/face` in Next.js.

```
Form fields:
  selfie     (file)
  event_id   (string)
  threshold  (float, default 0.6)
  photos     (JSON string — array of photos with pre-computed face embeddings)
```

Returns:
```json
{
  "matches": [
    { "_id": "uuid", "url": "...", "thumbnailUrl": "...", "facesCount": 2, "similarity": 0.87 }
  ],
  "total": 5
}
```

#### `GET /health`
Returns `{ "status": "ok", "model": "Facenet512" }`

### Auto-Tagging Logic

| Tag | Condition |
|---|---|
| `no-face` | 0 faces detected |
| `portrait` | Exactly 1 face |
| `group` | 2+ faces |
| `bright` | Mean brightness > 180 |
| `dark` | Mean brightness < 60 |

---

## 6. Backend (Express.js)

### Location: `backend/`

> **Note:** The Express backend is largely **bypassed** in the current architecture. All data now flows through Next.js API routes → Supabase directly. The Express routes remain for reference but face search and indexing no longer go through them.

### Routes (legacy)

| File | Endpoint | Purpose |
|---|---|---|
| `auth.js` | `/auth/register`, `/auth/login`, `/auth/me` | JWT-based auth |
| `events.js` | `/events`, `/events/:id` | Event CRUD |
| `photos.js` | `/photos/upload`, `/photos/index/:id` | Photo upload + indexing |
| `search.js` | `/search/face` | (was) proxy to AI service |
| `admin.js` | `/admin/*` | Admin panel ops |
| `photographer.js` | `/photographer/stats` | Stats stub |

---

## 7. Database (Supabase)

### Tables

#### `users`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `name`, `email` | text | email is unique |
| `password_hash` | text | bcrypt via pgcrypto |
| `role` | text | `user` / `photographer` / `admin` |
| `avatar` | text | URL |
| `banned` | boolean | |
| `plan` | text | `free` / `pro` / `studio` |

#### `events`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `code` | text unique | Public event code (e.g. `WEDD2026`) |
| `photographer_id` | uuid FK → users | |
| `drive_folder_id` | text | Google Drive folder |
| `drive_refresh_token` | text | Stored for guest proxy image access |
| `photo_count`, `search_count`, `download_count` | integer | Counters |
| `is_active` | boolean | Controls public access |

#### `photos`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `event_id` | uuid FK → events | |
| `url` | text | Cloudinary URL **or** `/api/drive/image?fileId=...&eventId=...` |
| `cloudinary_public_id` | text | Cloudinary ID **or** `drive:<fileId>` for Drive photos |
| `faces` | jsonb | Array of `{ faceId, embedding[512], bbox }` — written by AI |
| `faces_count` | integer | |
| `indexed` | boolean | `true` once AI has processed this photo |
| `tags` | text[] | `portrait`, `group`, `no-face`, `bright`, `dark` |

#### `search_logs`
Logs every guest search: `event_id`, `match_count`, `ip_address`, timestamp.

#### `photo_views`
Tracks per-photo view + download counts for analytics.

### Row Level Security

All tables have RLS enabled. The service role key (used server-side in Next.js API routes) bypasses RLS automatically. Public-facing routes use permissive `allow_all` policies; actual access control is enforced in the API route code.

### Useful SQL Functions

| Function | Purpose |
|---|---|
| `increment_event_counter(event_id, field)` | Atomically bumps search/download/photo counters |
| `increment_photo_count(event_id, amount)` | Batch-increments photo_count |
| `increment_photo_view(photo_id, event_id, name, action)` | Upserts view/download tracking |
| `hash_password(text)` | bcrypt hash |
| `check_password(email, password)` | Returns user row if credentials match |

---

## 8. Google Drive Integration

### Flow

```
Photographer clicks "Connect Drive"
       ↓
GET /api/drive/auth  →  Google OAuth2 consent screen
       ↓
GET /api/drive/callback  →  stores tokens in drive_tokens httpOnly cookie
       ↓
Photographer pastes folder URL → POST /api/drive/import
       ↓
listDriveImages() scans folder recursively (handles shortcuts + subfolders)
       ↓
For each image file:
  • cloudinary_public_id = "drive:<fileId>"   (dedup key, no upload)
  • url = "/api/drive/image?fileId=X&eventId=Y"   (proxy URL)
  • thumbnail_url = Drive's native thumbnailLink
  • Saved to Supabase photos table
       ↓
drive_refresh_token saved to events.drive_refresh_token
```

### Image Proxy (`/api/drive/image`)

| Caller | Auth method |
|---|---|
| Photographer (dashboard) | `drive_tokens` httpOnly cookie |
| Guest (face search results) | `?eventId=` param → lookup `events.drive_refresh_token` → refresh OAuth → stream image |
| AI service (indexing) | Receives direct `googleapis.com/drive/v3/files/{id}?alt=media&access_token=` URL — bypasses proxy |

---

## 9. Authentication Flow

### Photographer / Admin Login

```
POST /api/auth/login
  → supabase.rpc("check_password", { email, password })
  → JWT signed with AUTH_SECRET (httpOnly cookie, 7d expiry)
  → user object stored in Zustand store
```

### API Route Guards

Every protected API route calls `getUserFromRequest(req)` which:
1. Reads `auth_token` from cookies
2. Verifies JWT signature
3. Returns `{ id, email, role }` or `null`

### Password Reset

```
POST /api/auth/forgot-password
  → generate stateless AES-256-GCM token (contains email + expiry + HMAC of current password hash)
  → send email via nodemailer (SMTP)

POST /api/auth/reset-password
  → decrypt token, verify HMAC (ensures token is single-use — changing password invalidates it)
  → update password_hash in Supabase
```

### Email Verification

New accounts receive a verification email. Token is stored in Supabase and consumed on click.

---

## 10. Face Search Flow (End-to-End)

```
Guest visits /find
  ↓
Step 1: Enter event code (e.g. "WEDD2026")
  ↓
Step 2: Upload selfie or use webcam
  ↓
POST /api/search/face  (multipart: selfie file + eventCode)
  │
  ├─ Supabase: resolve event by code
  ├─ Supabase: fetch indexed photos WITH faces (JSONB embeddings)
  │
  └─ POST to AI service /search
       Form: selfie + event_id + threshold=0.6 + photos (JSON string)
         │
         ├─ DeepFace extracts selfie embedding (512-dim)
         ├─ Build FAISS IndexFlatIP from all photo face embeddings
         ├─ Cosine similarity search → sorted matches above threshold
         └─ Returns { matches, total }
  │
  ├─ Log to search_logs
  ├─ Increment events.search_count
  └─ Return matches to browser

Step 3: Show matched photos in lightbox grid
  (photos served via /api/drive/image proxy for Drive-sourced events)
```

**Fallback:** If AI service returns 503 or times out, the client switches to `face-api.js` (browser-based SsdMobilenetv1 model) automatically.

---

## 11. Face Indexing Flow

```
Photographer clicks "Index Faces" on event detail page
  ↓
POST /api/photos/index/[eventId]   (requires photographer session)
  │
  ├─ Verify event ownership in Supabase
  ├─ Fetch photos WHERE indexed = false
  ├─ Get Drive access token (from cookie or stored refresh_token)
  │
  └─ POST to AI service /index
       Body: { event_id, photos: [{id, url}], callback_url }
         (Drive photos get direct googleapis.com URL with ?access_token=)
  │
  Returns { queued: N } immediately (AI runs in background)
  ↓
AI service (background task, per photo):
  ├─ Download photo from url
  ├─ Extract all faces → embeddings + bounding boxes
  ├─ Auto-tag (portrait/group/no-face/bright/dark)
  └─ POST /api/photos/index-callback
       Body: { photoId, faces: [...], tags: [...] }
       Header: x-internal-secret
  ↓
/api/photos/index-callback:
  └─ UPDATE photos SET indexed=true, faces=..., faces_count=..., tags=...
     WHERE id = photoId
```

---

## 12. Environment Variables

### Frontend (`.env.local`)

```env
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:5000/api
AI_SERVICE_URL=http://localhost:8000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Auth
AUTH_SECRET=some-long-random-string

# Google Drive
GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-...
GOOGLE_REDIRECT_URI=http://localhost:3000/api/drive/callback

# Cloudinary (for direct uploads only)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your_app_password

# Internal security
INTERNAL_SECRET=same-as-ai-service
```

### AI Service (`.env`)

```env
APP_URL=http://localhost:3000
INTERNAL_SECRET=same-as-frontend
```

---

## 13. Running Locally

### Prerequisites

- Node.js 18+
- Python 3.10+
- Supabase project (free tier works)
- Google Cloud project with Drive API enabled

### 1. Database Setup

Run `supabase_schema.sql` in your Supabase Dashboard → SQL Editor.

If upgrading an existing database, run these migration statements first:
```sql
ALTER TABLE public.photos ADD COLUMN IF NOT EXISTS faces JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS drive_refresh_token TEXT;
```

### 2. Frontend

```bash
cd frontend
cp .env.local.example .env.local   # fill in your values
npm install
npm run dev                         # http://localhost:3000
```

### 3. AI Service

```bash
cd ai-service
python -m venv venv
source venv/bin/activate            # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env                # fill in values
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The first request will download the Facenet512 model (~90 MB) automatically.

### 4. (Optional) Express Backend

```bash
cd backend
npm install
npm run dev                         # http://localhost:5000
```

> The Express backend is not required for the core flow. Next.js handles all data operations via Supabase directly.

---

## 14. Database Schema

Full schema is in [`supabase_schema.sql`](./supabase_schema.sql). Key relationships:

```
users
 └── events (photographer_id → users.id)
      └── photos (event_id → events.id)
      └── search_logs (event_id → events.id)
      └── photo_views (event_id → events.id)
```

---

*Generated: June 2026 · PhotoFly v3*
