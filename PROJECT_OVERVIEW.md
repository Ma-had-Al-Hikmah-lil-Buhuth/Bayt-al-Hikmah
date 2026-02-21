# 📚 Online Islamic Library — Project Overview

## What Is This?

The **Online Islamic Library** (المكتبة الإسلامية) is a full-stack web application that serves as a digital library for Islamic scholarship. It hosts PDF books from classical and contemporary scholars across categories like Aqeedah, Fiqh, Hadith, Tafsir, and more — available in **Arabic, English, Bangla, and Urdu**.

Users can browse, search, read books online in the browser, download PDFs, and bookmark pages — all without leaving the website.

---

## 🛠️ Technology Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16 (App Router) | React framework with SSR, SSG, and server components for fast page loads and SEO |
| **TypeScript** | 5.x | Type-safe codebase across all files |
| **Tailwind CSS** | 4.x | Utility-first CSS framework for responsive, RTL-aware styling |
| **react-pdf** | Latest | Renders PDF files directly in the browser using PDF.js |
| **Lucide React** | Latest | Lightweight SVG icon library |
| **Zustand** | Latest | Client-side state management (available for future features) |

### Backend & Database

| Technology | Purpose |
|------------|---------|
| **Supabase** | Backend-as-a-Service providing PostgreSQL database, authentication, file storage, and real-time APIs |
| **PostgreSQL** | Relational database storing all book metadata, user profiles, bookmarks, and analytics |
| **Supabase Auth** | Email/password authentication with role-based access control (reader / editor / admin) |
| **Supabase Storage** | S3-compatible file storage for PDFs and book cover images, served via global CDN |
| **pg_trgm** | PostgreSQL extension for fuzzy trigram-based multilingual text search |

### Infrastructure

| Technology | Purpose |
|------------|---------|
| **Supabase CDN** | Global content delivery for fast PDF loading worldwide |
| **Next.js Middleware** | Handles locale detection, URL rewriting, and Supabase session refresh |
| **Row-Level Security (RLS)** | Database-level access control — books are public, bookmarks are user-scoped, writes require admin |

---

## 🔄 How It Works

### 1. User Visits the Site

```
User → http://localhost:3000
  ↓
Middleware detects no locale in URL
  ↓
Redirects to /en (or user's saved preference)
  ↓
Server Component renders the page with SSR
  ↓
HTML sent to browser (fast first paint, SEO-friendly)
```

### 2. Browsing & Searching Books

```
User types in search bar → "Ibn Taymiyyah"
  ↓
Request hits /en/books?q=Ibn+Taymiyyah
  ↓
Server calls Supabase RPC: search_books()
  ↓
PostgreSQL uses pg_trgm to fuzzy-match across
  ALL language fields (en, ar, bn, ur) in JSONB
  ↓
Results ranked by similarity score + view count
  ↓
BooksGrid component renders book cards with covers
```

### 3. Reading a Book Online

```
User clicks a book → /en/books/kitab-al-tawheed
  ↓
Server fetches book metadata + author + category
  ↓
Calls increment_view_count() (fire-and-forget)
  ↓
PdfReader component loads the PDF via react-pdf
  ↓
User can:
  • Navigate pages (prev/next/go-to)
  • Enter fullscreen mode
  • Bookmark the current page (saved to database)
```

### 4. Downloading a Book

```
User clicks "Download" → GET /api/download/:book-id
  ↓
API route checks is_downloadable flag
  ↓
Calls record_download() which:
  • Increments book.download_count
  • Inserts a row in download_logs (user, IP, timestamp)
  ↓
Redirects user to the CDN-served PDF URL
```

### 5. Admin Uploading a Book

```
Admin visits /en/admin/books/new
  ↓
Fills in multilingual title (EN/AR/BN/UR),
  selects author, category, language, copyright
  ↓
Attaches PDF file + optional cover image
  ↓
POST /api/admin/books
  ↓
API verifies admin role via Supabase Auth
  ↓
Uploads PDF to Supabase Storage (books bucket)
  ↓
Uploads cover to Supabase Storage (covers bucket)
  ↓
Inserts book record with all metadata into PostgreSQL
```

---

## 🌍 Multilingual Architecture

All text content uses **JSONB columns** for multilingual storage:

```json
{
  "en": "The Book of Monotheism",
  "ar": "كتاب التوحيد",
  "bn": "তাওহীদের কিতাব",
  "ur": "کتاب التوحید"
}
```

The `t()` utility function resolves the correct language at render time:

```typescript
t(book.title, "ar")  // → "كتاب التوحيد"
t(book.title, "en")  // → "The Book of Monotheism"
```

**RTL support** is automatic — the `<html>` tag gets `dir="rtl"` for Arabic and Urdu, and CSS logical properties (`start`/`end` instead of `left`/`right`) ensure the entire UI flips correctly.

---

## 🗄️ Database Design

### Entity Relationship

```
languages ←── books ──→ authors
                │
                ↓
             categories
                │
                ↓
  profiles ←── bookmarks
     │
     ↓
  reading_progress
     │
     ↓
  download_logs
```

### Key Tables

| Table | Records | Description |
|-------|---------|-------------|
| `books` | Core | Title (JSONB), PDF URL, cover image, view/download counters, copyright status |
| `authors` | 7 seeded | Scholar name (JSONB), bio, era (Classical/Medieval/Contemporary), death date (Hijri) |
| `categories` | 10 seeded | Aqeedah, Manhaj, Fiqh, Hadith, Tafsir, Seerah, Arabic Language, History, Fatawa, Tazkiyah |
| `languages` | 4 seeded | Arabic (RTL), English (LTR), Bangla (LTR), Urdu (RTL) |
| `profiles` | Per user | Extends Supabase Auth with display name, preferred language, role |
| `bookmarks` | Per user | Saves page number + optional label for a specific book |
| `download_logs` | Analytics | Tracks every download with IP, user-agent, and timestamp |

### Search Function

The `search_books()` PostgreSQL function:
- Accepts: search query, optional language/category/era filters, pagination
- Searches across **all JSONB language keys** in both `books.title` and `authors.name`
- Uses `pg_trgm` `similarity()` for fuzzy matching (handles typos and partial matches)
- Returns results ranked by relevance score + view count

---

## 📁 File Structure Summary

```
src/
├── app/                    # Next.js App Router
│   ├── [locale]/           # All pages are locale-prefixed (/en, /ar, /bn, /ur)
│   │   ├── page.tsx        # Homepage
│   │   ├── books/          # Book listing + detail pages
│   │   ├── categories/     # Category browser
│   │   ├── authors/        # Author profiles
│   │   ├── admin/          # Admin dashboard + upload
│   │   └── auth/           # Login + register
│   └── api/                # REST API routes
├── components/             # Reusable React components
├── dictionaries/           # i18n JSON files (en, ar, bn, ur)
├── lib/                    # Utilities + Supabase clients
├── types/                  # TypeScript type definitions
└── middleware.ts           # Locale routing + auth session

supabase/
└── schema.sql              # Complete database schema
```

---

## 🔒 Security Model

| Layer | Protection |
|-------|-----------|
| **Database (RLS)** | Books = public read; Bookmarks = user-scoped; Admin writes = role check |
| **API Routes** | Auth verification via `supabase.auth.getUser()` before mutations |
| **Admin Pages** | Server-side role check — non-admins get redirected |
| **Downloads** | Tracked with IP + user-agent; `is_downloadable` flag per book |
| **Copyright** | Per-book `copyright` enum: `public_domain`, `permission_granted`, `restricted` |
| **Storage** | Supabase Storage policies restrict uploads to admin role only |

---

## 🚀 Running the Project

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Start development server
npm run dev

# Build for production
npm run build && npm start
```

The app runs at `http://localhost:3000` and automatically redirects to `http://localhost:3000/en`.
