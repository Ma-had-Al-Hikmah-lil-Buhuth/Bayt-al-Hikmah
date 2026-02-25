# 🔗 Supabase Connection — Step-by-Step Setup Guide

This guide walks you through connecting the **Online Islamic Library** project to Supabase from scratch.

---

## ✅ Pre-requisites

- [x] Node.js installed
- [x] `npm install` done (project already has `@supabase/supabase-js` and `@supabase/ssr`)
- [x] Supabase client files ready (`src/lib/supabase/client.ts` & `server.ts`)
- [x] Database schema ready (`supabase/schema.sql`)
- [ ] **Supabase project created** ← start here 👇

---

## 📋 Step-by-Step

### Step 1 — Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign in (use GitHub login).
2. Click **"New Project"**.
3. Fill in:
   - **Project Name:** `islamic-library` (or anything you like)
   - **Database Password:** choose a strong password — **save it somewhere safe**
   - **Region:** pick the closest to your users (e.g. `South Asia (Mumbai)` or `US East`)
4. Click **"Create new project"** and wait ~2 minutes for it to provision.

---

### Step 2 — Get Your API Keys

1. In the Supabase Dashboard, go to **Settings → API** (left sidebar).
2. You will see:
   - **Project URL** → e.g. `https://xyzabc123.supabase.co`
   - **anon (public) key** → starts with `eyJhbGciOi...`
   - **service_role (secret) key** → starts with `eyJhbGciOi...` (**never expose this on the client**)
3. Copy all three values.

---

### Step 3 — Create the `.env.local` File

Create a `.env.local` file in the project root:

```bash
touch .env.local
```

Add the following (replace with your actual values):

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

> ⚠️ **Important:** `.env.local` is already in `.gitignore` by default in Next.js — never commit this file.

---

### Step 4 — Run the Database Schema

1. In the Supabase Dashboard, go to **SQL Editor** (left sidebar).
2. Click **"New Query"**.
3. Open `supabase/schema.sql` from this project, copy the **entire contents**.
4. Paste it into the SQL Editor.
5. Click **"Run"** (or press `Ctrl+Enter`).
6. You should see:
   - ✅ Tables created: `languages`, `categories`, `authors`, `books`, `tags`, `book_tags`, `profiles`, `bookmarks`, `reading_progress`, `download_logs`, `collections`, `collection_books`
   - ✅ Seed data inserted: 4 languages, 10 categories, 7 authors
   - ✅ Functions created: `search_books()`, `increment_view_count()`, `record_download()`
   - ✅ RLS policies enabled
   - ✅ Triggers set up

> 💡 **Tip:** If you get errors, run the schema in sections (one `CREATE TABLE` block at a time).

---

### Step 5 — Create Storage Buckets

1. In the Supabase Dashboard, go to **Storage** (left sidebar).
2. Click **"New Bucket"** and create:

| Bucket Name | Public? | Purpose |
|-------------|---------|---------|
| `books`     | ✅ Yes  | PDF files |
| `covers`    | ✅ Yes  | Book cover images |

3. For each bucket, go to **Policies** and add:

**Policy for `books` bucket — Public Read:**
```sql
-- Allow anyone to read/download PDFs
CREATE POLICY "Public read books"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'books');
```

**Policy for `covers` bucket — Public Read:**
```sql
-- Allow anyone to view cover images
CREATE POLICY "Public read covers"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'covers');
```

**Policy for Admin Upload (both buckets):**
```sql
-- Only admins can upload files
CREATE POLICY "Admin upload books"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id IN ('books', 'covers')
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

> You can run these in the **SQL Editor** or add them via the **Storage → Policies** UI.

---

### Step 6 — Enable Authentication

1. In the Supabase Dashboard, go to **Authentication → Providers**.
2. Make sure **Email** is enabled (it is by default).
3. Optionally configure:
   - ✅ **Confirm email:** toggle ON/OFF depending on your needs
   - ✅ **Secure email change:** recommended ON
4. Go to **Authentication → URL Configuration**:
   - **Site URL:** `http://localhost:3000` (for development)
   - **Redirect URLs:** add `http://localhost:3000/**`

---

### Step 7 — Set Up Auth Trigger for Profiles

When a user signs up, we need to auto-create a row in the `profiles` table. Run this in the **SQL Editor**:

```sql
-- Auto-create profile on user sign-up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, preferred_lang, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    'en',
    'reader'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

---

### Step 8 — Create Your First Admin User

1. Go to **Authentication → Users** in the Dashboard.
2. Click **"Add User"** → **"Create New User"**.
3. Enter your email and password.
4. After the user is created, go to **SQL Editor** and run:

```sql
-- Replace 'your-user-id-here' with the actual UUID from the auth.users table
UPDATE public.profiles
SET role = 'admin'
WHERE id = 'your-user-id-here';
```

> 💡 You can find the user UUID in **Authentication → Users** table.

---

### Step 9 — Test the Connection

Start the dev server:

```bash
npm run dev
```

Open `http://localhost:3000` — you should see the homepage. Then verify:

| Test | How to Check | Expected |
|------|-------------|----------|
| **Database connection** | Visit `/en/books` | Page loads without errors (may show empty list) |
| **Categories load** | Visit `/en/categories` | 10 seeded categories appear |
| **Authors load** | Visit `/en/authors` | 7 seeded scholars appear |
| **Auth works** | Visit `/en/auth/register` | Registration form submits successfully |
| **Admin panel** | Login as admin → visit `/en/admin` | Admin dashboard loads |
| **Search works** | Type in search bar on `/en/books` | No console errors |

---

### Step 10 — Upload Your First Book (Admin)

1. Login as admin user.
2. Go to `/en/admin/books/new`.
3. Fill in the book details (title, author, category, etc.).
4. Upload a PDF file + cover image.
5. Submit — the book should appear on `/en/books`.

---

## 🔧 Troubleshooting

| Problem | Solution |
|---------|----------|
| `NEXT_PUBLIC_SUPABASE_URL is not defined` | Make sure `.env.local` exists and restart the dev server (`npm run dev`) |
| `relation "public.books" does not exist` | You haven't run the schema yet — go to Step 4 |
| `new row violates RLS policy` | Check that RLS policies are created correctly — go to Step 4 |
| `Storage: bucket not found` | Create the `books` and `covers` buckets — go to Step 5 |
| `Auth: user not found in profiles` | The auth trigger may not be set up — go to Step 7 |
| `403 on admin pages` | Your user doesn't have `admin` role — go to Step 8 |
| CORS errors | Make sure your Site URL is set correctly in Auth settings — go to Step 6 |

---

## 📂 Files That Use Supabase

| File | Type | Purpose |
|------|------|---------|
| `src/lib/supabase/client.ts` | Browser client | Used in Client Components |
| `src/lib/supabase/server.ts` | Server client | Used in Server Components & API routes |
| `src/middleware.ts` | Middleware | Refreshes Supabase auth session on every request |
| `src/app/api/**/*.ts` | API routes | Server-side Supabase queries |
| `.env.local` | Environment | Stores Supabase URL + keys |

---

## 🔜 What To Do After Setup

Once Supabase is connected and working:

1. **Upload sample books** — add 5-10 books to test the full flow
2. **Test PDF reading** — make sure `react-pdf` renders books from Supabase Storage
3. **Test bookmarks** — login as a reader and save bookmarks
4. **Test search** — try searching in Arabic and English
5. **Deploy** — set the same env vars on Vercel/Netlify and deploy
