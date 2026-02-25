# 📚 Online Islamic Library (المكتبة الإسلامية)

A comprehensive, multilingual Digital Library Management System built with **Next.js 16**, **Supabase**, and **Tailwind CSS**. Hosts thousands of Islamic PDF books with full-text search, in-browser reading, bookmarking, and an admin dashboard.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🌍 **Multilingual** | Full i18n in Arabic, English, Bangla & Urdu with automatic RTL support |
| 🔍 **Advanced Search** | Fuzzy multilingual search (pg_trgm) by title, author, category & scholar era |
| 📖 **PDF Reader** | In-browser reading with PDF.js — page navigation, fullscreen, bookmarks |
| 📥 **Secure Downloads** | Tracked download links with per-book analytics |
| 🛡️ **Auth & RBAC** | Supabase Auth with reader / editor / admin roles |
| 📊 **Admin Dashboard** | Upload PDFs, manage metadata, view statistics |
| ⚡ **Edge-optimised** | CDN-served PDFs, SSR pages, image optimisation |
| 📱 **Responsive** | Mobile-first design with Tailwind CSS |

---

## 🗂️ Project Structure

```
src/
├── app/
│   ├── globals.css                   # Global styles + RTL + PDF viewer
│   ├── layout.tsx                    # Root layout (passthrough)
│   ├── [locale]/                     # ← Locale-prefixed routes
│   │   ├── layout.tsx                # HTML shell with dir/lang + header/footer
│   │   ├── page.tsx                  # Home — hero, categories, featured books
│   │   ├── books/
│   │   │   ├── page.tsx              # Discovery — search + filter sidebar + grid
│   │   │   └── [slug]/page.tsx       # Book detail — metadata, PDF reader, related
│   │   ├── categories/page.tsx       # Category listing
│   │   ├── authors/
│   │   │   ├── page.tsx              # Authors grouped by era
│   │   │   └── [id]/page.tsx         # Author profile + their books
│   │   ├── admin/
│   │   │   ├── page.tsx              # Admin dashboard — stats + quick actions
│   │   │   └── books/new/page.tsx    # Upload book form
│   │   └── auth/
│   │       ├── login/page.tsx        # Sign in
│   │       └── register/page.tsx     # Sign up
│   └── api/
│       ├── books/route.ts            # GET /api/books (public search)
│       ├── bookmarks/route.ts        # POST/GET/DELETE /api/bookmarks
│       ├── download/[id]/route.ts    # GET /api/download/:id (tracked)
│       └── admin/books/route.ts      # POST /api/admin/books (upload)
├── components/
│   ├── layout/
│   │   ├── Header.tsx                # Sticky navbar + locale switcher + mobile menu
│   │   └── Footer.tsx                # Footer with category & author links
│   ├── books/
│   │   ├── SearchBar.tsx             # Search input + sort dropdown
│   │   ├── FilterSidebar.tsx         # Category / language / era filters
│   │   ├── BooksGrid.tsx             # Book card grid + pagination
│   │   └── PdfReader.tsx             # Full PDF viewer (react-pdf)
│   └── admin/
│       └── UploadBookForm.tsx        # Multi-lang book upload form
├── dictionaries/
│   ├── index.ts                      # Dynamic dictionary loader
│   ├── en.json                       # English translations
│   ├── ar.json                       # Arabic translations
│   ├── bn.json                       # Bangla translations
│   └── ur.json                       # Urdu translations
├── lib/
│   ├── utils.ts                      # cn(), t(), formatCount(), localePath()
│   └── supabase/
│       ├── client.ts                 # Browser Supabase client
│       └── server.ts                 # Server + Admin Supabase clients
├── types/
│   └── database.ts                   # Full TypeScript types for all tables
└── middleware.ts                      # Locale redirect + Supabase session refresh

supabase/
└── schema.sql                        # Complete PostgreSQL schema (16 sections)
```

---

## 🗄️ Database Schema

| Table | Purpose |
|-------|---------|
| `languages` | Supported locales (ar, en, bn, ur) with LTR/RTL direction |
| `categories` | Hierarchical book categories with JSONB multilingual names |
| `authors` | Scholar profiles with era, death date (Hijri), multilingual bio |
| `books` | Core catalogue — JSONB titles, PDF URL, copyright status, counters |
| `tags` / `book_tags` | Flexible many-to-many tagging |
| `profiles` | Extends `auth.users` with role (reader/editor/admin) |
| `bookmarks` | User-saved page positions per book |
| `reading_progress` | Last-read page tracking |
| `download_logs` | Analytics: IP, user-agent, timestamp per download |
| `collections` | Curated reading lists |

### Key SQL Features
- **`search_books()` RPC** — Fuzzy multilingual search using `pg_trgm` + `similarity()`
- **`increment_view_count()`** — Atomic view counter
- **`record_download()`** — Download logger + counter in one call
- **Row-Level Security** — Public read for books, user-scoped bookmarks/progress, admin-only writes
- **GIN indexes** on JSONB title fields for fast search

---

## 🚀 Getting Started

### 1. Clone & Install

```bash
git clone <repo-url> && cd Libery
npm install
```

### 2. Set Up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run `supabase/schema.sql` in the SQL Editor
3. Create storage buckets: `books` (public) and `covers` (public)
4. Copy your keys into `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000/en](http://localhost:3000/en) — it will redirect to the English locale.

### 4. Create an Admin User

1. Sign up via `/en/auth/register`
2. In Supabase SQL Editor:
```sql
UPDATE public.profiles SET role = 'admin' WHERE id = '<your-user-id>';
```
3. Access the admin dashboard at `/en/admin`

---

## 🌐 Supported Languages

| Code | Language | Direction |
|------|----------|-----------|
| `en` | English | LTR |
| `ar` | العربية | RTL |
| `bn` | বাংলা | LTR |
| `ur` | اردو | RTL |

The UI automatically flips for RTL languages. All database text fields use JSONB for multilingual storage.

---

## 📦 Tech Stack

- **Framework:** Next.js 16 (App Router, Server Components, Turbopack)
- **Database:** Supabase (PostgreSQL + Auth + Storage)
- **Styling:** Tailwind CSS 4
- **PDF:** react-pdf / PDF.js
- **Icons:** Lucide React
- **State:** Zustand (available for client-side state)
- **Search:** PostgreSQL pg_trgm + custom RPC function

---

## 📜 License

MIT
