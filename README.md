# Vault — Game Library App

Aplikasi full-stack untuk mengelola koleksi game pribadi. Dibangun dengan Next.js, Vercel Postgres, dan JWT authentication.

---

## Struktur Folder & File

```
gamelibrary/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx                # Root layout (font, metadata)
│   │   ├── globals.css               # Design system (CSS variables, animasi)
│   │   ├── page.tsx                  # "/" → redirect ke /landing jika belum login
│   │   │
│   │   ├── landing/
│   │   │   └── page.tsx              # Halaman landing + overlay login/register
│   │   │
│   │   ├── account/
│   │   │   └── page.tsx              # Halaman akun (profil, edit, hapus)
│   │   │
│   │   └── api/                      # REST API Endpoints
│   │       ├── auth/
│   │       │   ├── register/route.ts # POST /api/auth/register
│   │       │   ├── login/route.ts    # POST /api/auth/login
│   │       │   ├── logout/route.ts   # POST /api/auth/logout
│   │       │   ├── refresh/route.ts  # POST /api/auth/refresh
│   │       │   └── me/route.ts       # GET  /api/auth/me (current user)
│   │       ├── games/
│   │       │   ├── route.ts          # GET /api/games, POST /api/games
│   │       │   └── [id]/route.ts     # GET/PUT/DELETE /api/games/:id
│   │       ├── account/
│   │       │   └── route.ts          # PUT/DELETE /api/account
│   │       └── init-db/
│   │           └── route.ts          # GET /api/init-db (setup awal)
│   │
│   ├── components/                   # React Client Components
│   │   ├── LandingClient.tsx         # Halaman landing + modal auth
│   │   ├── LandingClient.module.css
│   │   ├── LibraryClient.tsx         # Halaman library utama
│   │   ├── LibraryClient.module.css
│   │   ├── GameModal.tsx             # Modal tambah/edit game
│   │   ├── GameModal.module.css
│   │   ├── AccountClient.tsx         # Halaman pengaturan akun
│   │   └── AccountClient.module.css
│   │
│   ├── lib/                          # Utilities / helpers
│   │   ├── db.ts                     # Koneksi Vercel Postgres + schema
│   │   ├── jwt.ts                    # Sign & verify JWT tokens
│   │   └── middleware.ts             # withAuth() helper untuk API routes
│   │
│   ├── types/
│   │   └── index.ts                  # TypeScript types (User, Game, dll)
│   │
│   └── scripts/
│       └── init-db.ts                # Script inisialisasi tabel DB
│
├── .env.example                      # Contoh variabel lingkungan
├── .gitignore
├── next.config.js
├── package.json
└── tsconfig.json
```

---

## Setup & Instalasi

### 1. Clone & install dependencies

```bash
git clone <repo-url>
cd gamelibrary
npm install
```

### 2. Setup Vercel Postgres

1. Login ke [vercel.com](https://vercel.com) dan buat project baru
2. Di dashboard project, buka tab **Storage**
3. Klik **Create Database** → pilih **Postgres**
4. Beri nama database (contoh: `gamelibrary-db`)
5. Setelah dibuat, klik **Connect to Project** → pilih project Anda
6. Buka tab **Settings** di database → copy semua environment variables

### 3. Setup Environment Variables

Buat file `.env.local` di root project:

```env
# Dari Vercel Postgres dashboard
POSTGRES_URL=postgres://...
POSTGRES_PRISMA_URL=postgres://...?pgbouncer=true
POSTGRES_URL_NON_POOLING=postgres://...
POSTGRES_USER=default
POSTGRES_HOST=...
POSTGRES_PASSWORD=...
POSTGRES_DATABASE=verceldb

# Generate sendiri
JWT_SECRET=ganti-dengan-string-random-panjang
JWT_REFRESH_SECRET=ganti-dengan-string-random-lain
```

Generate secret yang aman:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 4. Inisialisasi Database

Jalankan dev server terlebih dahulu:
```bash
npm run dev
```

Lalu buka browser dan akses:
```
http://localhost:3000/api/init-db?secret=<JWT_SECRET_anda>
```

Jika berhasil, response:
```json
{ "success": true, "message": "Database tables created successfully" }
```

### 5. Jalankan aplikasi

```bash
npm run dev
# Buka http://localhost:3000
```

---

## Deploy ke Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables di Vercel Dashboard:
# Settings → Environment Variables → tambahkan JWT_SECRET & JWT_REFRESH_SECRET
# (POSTGRES_* sudah otomatis ter-link jika DB dibuat dari Vercel)
```

Setelah deploy, jalankan init-db sekali:
```
https://your-app.vercel.app/api/init-db?secret=<JWT_SECRET>
```

---

## Daftar Endpoints

### Authentication

| Method | Endpoint | Deskripsi | Auth |
|--------|----------|-----------|------|
| POST | `/api/auth/register` | Daftar akun baru | Tidak |
| POST | `/api/auth/login` | Login | Tidak |
| POST | `/api/auth/logout` | Logout | Tidak |
| POST | `/api/auth/refresh` | Refresh access token | Cookie |
| GET  | `/api/auth/me` | Data user yang login | JWT |

### Games (semua endpoint dilindungi JWT)

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET    | `/api/games` | Ambil semua game milik user (support query: `search`, `genre`, `platform`) |
| POST   | `/api/games` | Tambah game baru |
| GET    | `/api/games/:id` | Detail satu game |
| PUT    | `/api/games/:id` | Update game |
| DELETE | `/api/games/:id` | Hapus game |

### Account

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| PUT    | `/api/account` | Update nickname dan/atau password |
| DELETE | `/api/account` | Hapus akun (butuh konfirmasi password) |

---

## Format Request & Response

### POST /api/auth/register

**Request:**
```json
{
  "username": "gamer123",
  "email": "user@example.com",
  "password": "secret123",
  "nickname": "Gamer"  // opsional
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "user": { "id": 1, "username": "gamer123", "email": "...", "nickname": "Gamer" }
  },
  "message": "Account created successfully"
}
```

### POST /api/games

**Request:**
```json
{
  "title": "Elden Ring",
  "genre": "Action RPG",
  "platform": "PC",
  "cover_url": "https://...",  // opsional
  "notes": "Completed NG+"     // opsional
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "game": {
      "id": 1, "user_id": 1,
      "title": "Elden Ring", "genre": "Action RPG", "platform": "PC",
      "cover_url": null, "notes": null,
      "created_at": "2026-03-09T...", "updated_at": "2026-03-09T..."
    }
  }
}
```

---

## Fitur & Best Practices

### Backend
- JWT Authentication dengan access token (15 menit) + refresh token (7 hari) via httpOnly cookies
- Password di-hash menggunakan bcrypt (salt rounds: 12)
- Middleware `withAuth()` untuk proteksi semua endpoint resource
- Input validation pada semua endpoint
- SQL injection protection via parameterized queries (`@vercel/postgres`)
- Cascade delete: hapus user → otomatis hapus semua game & token
- Error handling konsisten dengan format `{ success, data, error, message }`

### Frontend
- Server-side auth check di page level (Next.js Server Components)
- Auto-redirect jika belum login
- Client-side state management dengan React hooks
- Combobox platform dengan opsi "Other" untuk input manual
- Filter game berdasarkan judul, genre, dan platform
- Cover game bisa diisi URL dengan preview langsung
- Responsive design dengan sidebar navigation
- Smooth transitions & animasi CSS
- Loading states & skeleton placeholders
