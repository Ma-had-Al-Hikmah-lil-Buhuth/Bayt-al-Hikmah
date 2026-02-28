-- ============================================================================
-- ONLINE ISLAMIC LIBRARY — Complete Database Schema
-- Supabase / PostgreSQL
-- ============================================================================
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- trigram fuzzy search
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- strip diacritics for search
-- ============================================================================
-- 1. LANGUAGES
-- ============================================================================
CREATE TABLE public.languages (
    code VARCHAR(5) PRIMARY KEY NOT NULL UNIQUE,  -- ar, en, bn, ur
    name VARCHAR(16) NOT NULL,
    direction VARCHAR(3) NOT NULL DEFAULT 'ltr' -- ltr | rtl
    CHECK (direction IN ('ltr', 'rtl')),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.languages IS 'Supported UI / content languages';

INSERT INTO
    public.languages (code, name, direction)
VALUES
    ('ar', 'Arabic', 'rtl'),
    ('en', 'English', 'ltr'),
    ('bn', 'Bangla', 'ltr'),
    ('ur', 'Urdu', 'rtl');

-- ============================================================================
-- 2. AUTHORS (Scholars)
-- ============================================================================
CREATE TABLE public.authors (
    id SERIAL PRIMARY KEY,
    name JSONB NOT NULL DEFAULT '{}',  -- {"en":"…","ar":"…"}
    bio JSONB DEFAULT '{}',             -- {"en":"…","ar":"…"}
    birth_year INT,                     -- e.g. 150 (Hijri)
    death_year INT,                     -- e.g. 241 (Hijri)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for fast text search on JSONB name fields
CREATE INDEX idx_authors_name_en ON public.authors USING GIN ((name ->> 'en') gin_trgm_ops);
CREATE INDEX idx_authors_name_ar ON public.authors USING GIN ((name ->> 'ar') gin_trgm_ops);

COMMENT ON TABLE public.authors IS 'Scholars & authors with multilingual names and bio';

-- ============================================================================
-- 3. BOOKS
-- ============================================================================
CREATE TABLE public.books (
    id SERIAL PRIMARY KEY,
    title JSONB NOT NULL DEFAULT '{}',  -- {"en":"…","ar":"…"}
    slug VARCHAR(200) NOT NULL UNIQUE,
    author_id INT REFERENCES public.authors(id) ON DELETE RESTRICT,
    translator_id INT REFERENCES public.authors(id) ON DELETE SET NULL,
    category_id VARCHAR(60) NOT NULL,   -- matches id from categories.json
    language_code VARCHAR(5) NOT NULL REFERENCES public.languages(code),
    description JSONB DEFAULT '{}',
    pdf_url TEXT NOT NULL,
    cover_image_url TEXT,
    page_count INT,
    is_downloadable BOOLEAN NOT NULL DEFAULT TRUE,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    view_count BIGINT NOT NULL DEFAULT 0,
    download_count BIGINT NOT NULL DEFAULT 0,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_books_author ON public.books(author_id);
CREATE INDEX idx_books_translator ON public.books(translator_id);
CREATE INDEX idx_books_category ON public.books(category_id);
CREATE INDEX idx_books_language ON public.books(language_code);
CREATE INDEX idx_books_slug ON public.books(slug);
CREATE INDEX idx_books_featured ON public.books(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_books_view_count ON public.books(view_count DESC);
CREATE INDEX idx_books_title_gin ON public.books USING GIN (title jsonb_path_ops);

COMMENT ON TABLE public.books IS 'Book catalogue with multilingual metadata';

-- ============================================================================
-- 3b. BOOK TRANSLATIONS (many-to-many self-join)
-- ============================================================================
-- Every pair of books that are translations of each other gets a row.
-- Always stored with book_a_id < book_b_id to avoid duplicate pairs.
CREATE TABLE public.book_translations (
    book_a_id INT NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
    book_b_id INT NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
    PRIMARY KEY (book_a_id, book_b_id),
    CHECK (book_a_id < book_b_id)
);

CREATE INDEX idx_book_translations_a ON public.book_translations(book_a_id);
CREATE INDEX idx_book_translations_b ON public.book_translations(book_b_id);

COMMENT ON TABLE public.book_translations IS 'Symmetric many-to-many: books that are translations of each other';

-- ============================================================================
-- 4. TAGS (many-to-many flexible tagging)
-- ============================================================================
CREATE TABLE public.tags (
    id SERIAL PRIMARY KEY,
    name JSONB NOT NULL DEFAULT '{}',
    slug VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE public.book_tags (
    book_id INT NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
    tag_id INT NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
    PRIMARY KEY (book_id, tag_id)
);

-- ============================================================================
-- 5. USERS (standalone JWT-based auth)
-- ============================================================================
CREATE TABLE public.users (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,  -- bcrypt hash
    is_admin BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_users_email ON public.users(email);

COMMENT ON TABLE public.users IS 'Application users with JWT auth; is_admin=false by default';

-- ============================================================================
-- 6. DOWNLOAD LOG (analytics)
-- ============================================================================
CREATE TABLE public.download_logs (
    id SERIAL PRIMARY KEY,
    book_id INT NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
    user_id INT REFERENCES public.users(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_download_logs_book ON public.download_logs(book_id);
CREATE INDEX idx_download_logs_date ON public.download_logs(created_at);

-- ============================================================================
-- 7. FULL-TEXT SEARCH
-- ============================================================================
CREATE OR REPLACE FUNCTION public.search_books(
    search_query TEXT,
    lang_code TEXT DEFAULT NULL,
    cat_id TEXT DEFAULT NULL,
    result_limit INT DEFAULT 20,
    result_offset INT DEFAULT 0
) RETURNS TABLE (
    id INT,
    title JSONB,
    slug VARCHAR,
    author_name JSONB,
    category_id VARCHAR,
    cover_image_url TEXT,
    language_code VARCHAR,
    view_count BIGINT,
    rank REAL
) LANGUAGE plpgsql STABLE AS
$$
BEGIN
RETURN QUERY
SELECT
    b.id,
    b.title,
    b.slug,
    a.name AS author_name,
    b.category_id,
    b.cover_image_url,
    b.language_code,
    b.view_count,
    GREATEST(
        similarity(COALESCE(b.title ->> 'en', ''), search_query),
        similarity(COALESCE(b.title ->> 'ar', ''), search_query),
        similarity(COALESCE(b.title ->> 'bn', ''), search_query),
        similarity(COALESCE(b.title ->> 'ur', ''), search_query),
        similarity(COALESCE(a.name ->> 'en', ''), search_query),
        similarity(COALESCE(a.name ->> 'ar', ''), search_query)
    )::REAL AS rank
FROM
    public.books b
    LEFT JOIN public.authors a ON a.id = b.author_id
WHERE
    (
        search_query = ''
        OR b.title ->> 'en' ILIKE '%' || search_query || '%'
        OR b.title ->> 'ar' ILIKE '%' || search_query || '%'
        OR b.title ->> 'bn' ILIKE '%' || search_query || '%'
        OR b.title ->> 'ur' ILIKE '%' || search_query || '%'
        OR a.name ->> 'en' ILIKE '%' || search_query || '%'
        OR a.name ->> 'ar' ILIKE '%' || search_query || '%'
    )
    AND (
        lang_code IS NULL
        OR b.language_code = lang_code
    )
    AND (
        cat_id IS NULL
        OR b.category_id = cat_id
    )
ORDER BY
    rank DESC,
    b.view_count DESC
LIMIT
    result_limit OFFSET result_offset;
END;
$$;

-- ============================================================================
-- 8. HELPERS
-- ============================================================================
CREATE OR REPLACE FUNCTION public.increment_view_count(book_id_param INT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS
$$
BEGIN
UPDATE public.books
SET view_count = view_count + 1, updated_at = NOW()
WHERE id = book_id_param;
END;
$$;

CREATE OR REPLACE FUNCTION public.record_download(
    p_book_id INT,
    p_user_id INT DEFAULT NULL,
    p_ip INET DEFAULT NULL,
    p_ua TEXT DEFAULT NULL
) RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS
$$
BEGIN
UPDATE public.books
SET download_count = download_count + 1, updated_at = NOW()
WHERE id = p_book_id;

INSERT INTO public.download_logs (book_id, user_id, ip_address, user_agent)
VALUES (p_book_id, p_user_id, p_ip, p_ua);
END;
$$;

-- ============================================================================
-- 9. TRIGGERS: auto-update updated_at
-- ============================================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS
$$
BEGIN
NEW.updated_at = NOW();
RETURN NEW;
END;
$$;

CREATE TRIGGER trg_books_updated BEFORE UPDATE ON public.books
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_authors_updated BEFORE UPDATE ON public.authors
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_users_updated BEFORE UPDATE ON public.users
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- 10. ROW-LEVEL SECURITY
-- ============================================================================
ALTER TABLE public.authors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.download_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authors are publicly readable" ON public.authors
FOR SELECT USING (TRUE);

CREATE POLICY "Books are publicly readable" ON public.books
FOR SELECT USING (TRUE);

CREATE POLICY "Book translations are publicly readable" ON public.book_translations
FOR SELECT USING (TRUE);

CREATE POLICY "Tags are publicly readable" ON public.tags
FOR SELECT USING (TRUE);

-- ============================================================================
-- 11. STORAGE BUCKETS (run via Supabase Dashboard or CLI)
-- ============================================================================
-- INSERT INTO storage.buckets (id, name, public) VALUES ('books',  'books',  true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('covers', 'covers', true);
