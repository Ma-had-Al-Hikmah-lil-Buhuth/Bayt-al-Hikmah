-- ============================================================================
-- ONLINE ISLAMIC LIBRARY — Complete Database Schema
-- Supabase / PostgreSQL
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";       -- trigram fuzzy search
CREATE EXTENSION IF NOT EXISTS "unaccent";       -- strip diacritics for search

-- ============================================================================
-- 1. LANGUAGES
-- ============================================================================
CREATE TABLE public.languages (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code        VARCHAR(5)  NOT NULL UNIQUE,          -- ar, en, bn, ur
    name        JSONB       NOT NULL DEFAULT '{}',    -- {"en":"Arabic","ar":"العربية"}
    direction   VARCHAR(3)  NOT NULL DEFAULT 'ltr'    -- ltr | rtl
        CHECK (direction IN ('ltr', 'rtl')),
    is_active   BOOLEAN     NOT NULL DEFAULT true,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.languages IS 'Supported UI / content languages';

INSERT INTO public.languages (code, name, direction) VALUES
    ('ar', '{"en":"Arabic","ar":"العربية","bn":"আরবি","ur":"عربی"}', 'rtl'),
    ('en', '{"en":"English","ar":"الإنجليزية","bn":"ইংরেজি","ur":"انگریزی"}', 'ltr'),
    ('bn', '{"en":"Bangla","ar":"البنغالية","bn":"বাংলা","ur":"بنگالی"}', 'ltr'),
    ('ur', '{"en":"Urdu","ar":"الأوردو","bn":"উর্দু","ur":"اردو"}', 'rtl');

-- ============================================================================
-- 2. CATEGORIES
-- ============================================================================
CREATE TABLE public.categories (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        JSONB       NOT NULL DEFAULT '{}',    -- {"en":"Aqeedah","ar":"عقيدة"}
    slug        VARCHAR(120) NOT NULL UNIQUE,
    description JSONB       DEFAULT '{}',
    icon_url    TEXT,
    sort_order  INT         NOT NULL DEFAULT 0,
    parent_id   UUID        REFERENCES public.categories(id) ON DELETE SET NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_categories_slug ON public.categories(slug);
CREATE INDEX idx_categories_parent ON public.categories(parent_id);

COMMENT ON TABLE public.categories IS 'Hierarchical book categories (Aqeedah, Fiqh, Hadith…)';

INSERT INTO public.categories (name, slug, description) VALUES
    ('{"en":"Aqeedah","ar":"عقيدة","bn":"আকীদাহ","ur":"عقیدہ"}',         'aqeedah',   '{"en":"Islamic Creed & Theology"}'),
    ('{"en":"Manhaj","ar":"منهج","bn":"মানহাজ","ur":"منہج"}',             'manhaj',    '{"en":"Methodology of the Salaf"}'),
    ('{"en":"Fiqh","ar":"فقه","bn":"ফিকহ","ur":"فقہ"}',                   'fiqh',      '{"en":"Islamic Jurisprudence"}'),
    ('{"en":"Hadith","ar":"حديث","bn":"হাদীস","ur":"حدیث"}',              'hadith',    '{"en":"Prophetic Traditions"}'),
    ('{"en":"Tafsir","ar":"تفسير","bn":"তাফসীর","ur":"تفسیر"}',            'tafsir',    '{"en":"Quranic Exegesis"}'),
    ('{"en":"Seerah","ar":"سيرة","bn":"সীরাত","ur":"سیرت"}',              'seerah',    '{"en":"Prophetic Biography"}'),
    ('{"en":"Arabic Language","ar":"اللغة العربية","bn":"আরবি ভাষা","ur":"عربی زبان"}', 'arabic-language', '{"en":"Grammar, Morphology & Rhetoric"}'),
    ('{"en":"History","ar":"تاريخ","bn":"ইতিহাস","ur":"تاریخ"}',           'history',   '{"en":"Islamic History & Civilisation"}'),
    ('{"en":"Fatawa","ar":"فتاوى","bn":"ফাতাওয়া","ur":"فتاویٰ"}',          'fatawa',    '{"en":"Scholarly Rulings & Verdicts"}'),
    ('{"en":"Tazkiyah","ar":"تزكية","bn":"তাযকিয়াহ","ur":"تزکیہ"}',       'tazkiyah',  '{"en":"Purification of the Soul"}');

-- ============================================================================
-- 3. AUTHORS (Scholars)
-- ============================================================================
CREATE TABLE public.authors (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            JSONB       NOT NULL DEFAULT '{}',  -- {"en":"…","ar":"…"}
    bio             JSONB       DEFAULT '{}',
    era             VARCHAR(60),                        -- e.g. "Classical", "Medieval", "Contemporary"
    birth_date_hijri VARCHAR(30),
    death_date_hijri VARCHAR(30),
    photo_url       TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_authors_era ON public.authors(era);

COMMENT ON TABLE public.authors IS 'Scholars & authors with multilingual bios';

INSERT INTO public.authors (name, bio, era, death_date_hijri) VALUES
    (
        '{"en":"Imam Malik ibn Anas","ar":"الإمام مالك بن أنس","bn":"ইমাম মালিক ইবনু আনাস","ur":"امام مالک بن انس"}',
        '{"en":"Founder of the Maliki school, author of al-Muwatta."}',
        'Classical', '179 AH'
    ),
    (
        '{"en":"Imam Ahmad ibn Hanbal","ar":"الإمام أحمد بن حنبل","bn":"ইমাম আহমাদ ইবনু হাম্বাল","ur":"امام احمد بن حنبل"}',
        '{"en":"Founder of the Hanbali school, compiled the Musnad."}',
        'Classical', '241 AH'
    ),
    (
        '{"en":"Ibn Taymiyyah","ar":"ابن تيمية","bn":"ইবনু তাইমিয়্যাহ","ur":"ابن تیمیہ"}',
        '{"en":"Shaykh al-Islam, prolific scholar of the 7th–8th century AH."}',
        'Medieval', '728 AH'
    ),
    (
        '{"en":"Ibn al-Qayyim","ar":"ابن القيم","bn":"ইবনুল কায়্যিম","ur":"ابن القیم"}',
        '{"en":"Student of Ibn Taymiyyah, author of Zad al-Ma''ad."}',
        'Medieval', '751 AH'
    ),
    (
        '{"en":"Shaykh Ibn Baz","ar":"الشيخ ابن باز","bn":"শাইখ ইবনু বায","ur":"شیخ ابن باز"}',
        '{"en":"Grand Mufti of Saudi Arabia (1993–1999), major authority of the 20th century."}',
        'Contemporary', '1420 AH'
    ),
    (
        '{"en":"Shaykh al-Uthaymeen","ar":"الشيخ العثيمين","bn":"শাইখ আল-উসাইমীন","ur":"شیخ العثیمین"}',
        '{"en":"Renowned jurist, teacher, and author of al-Sharh al-Mumti."}',
        'Contemporary', '1421 AH'
    ),
    (
        '{"en":"Shaykh al-Albani","ar":"الشيخ الألباني","bn":"শাইখ আল-আলবানী","ur":"شیخ البانی"}',
        '{"en":"Leading hadith scholar of the 20th century, authored Silsilah al-Sahihah."}',
        'Contemporary', '1420 AH'
    );

-- ============================================================================
-- 4. BOOKS
-- ============================================================================
CREATE TYPE public.copyright_status AS ENUM ('public_domain', 'permission_granted', 'restricted');

CREATE TABLE public.books (
    id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title            JSONB        NOT NULL DEFAULT '{}',   -- {"en":"…","ar":"…"}
    slug             VARCHAR(200) NOT NULL UNIQUE,
    author_id        UUID         NOT NULL REFERENCES public.authors(id) ON DELETE RESTRICT,
    category_id      UUID         NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
    language_code    VARCHAR(5)   NOT NULL REFERENCES public.languages(code),
    description      JSONB        DEFAULT '{}',
    pdf_url          TEXT         NOT NULL,
    cover_image_url  TEXT,
    page_count       INT,
    is_downloadable  BOOLEAN      NOT NULL DEFAULT true,
    is_featured      BOOLEAN      NOT NULL DEFAULT false,
    copyright        public.copyright_status NOT NULL DEFAULT 'public_domain',
    view_count       BIGINT       NOT NULL DEFAULT 0,
    download_count   BIGINT       NOT NULL DEFAULT 0,
    published_at     TIMESTAMPTZ,
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at       TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_books_author     ON public.books(author_id);
CREATE INDEX idx_books_category   ON public.books(category_id);
CREATE INDEX idx_books_language   ON public.books(language_code);
CREATE INDEX idx_books_slug       ON public.books(slug);
CREATE INDEX idx_books_featured   ON public.books(is_featured) WHERE is_featured = true;
CREATE INDEX idx_books_view_count ON public.books(view_count DESC);

-- GIN index for fast JSONB title/description search
CREATE INDEX idx_books_title_gin  ON public.books USING GIN (title jsonb_path_ops);

COMMENT ON TABLE public.books IS 'Book catalogue with multilingual metadata';

-- ============================================================================
-- 5. BOOK ↔ TAG  (many-to-many flexible tagging)
-- ============================================================================
CREATE TABLE public.tags (
    id   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name JSONB NOT NULL DEFAULT '{}',
    slug VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE public.book_tags (
    book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
    tag_id  UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
    PRIMARY KEY (book_id, tag_id)
);

-- ============================================================================
-- 6. USER PROFILES  (extends Supabase Auth)
-- ============================================================================
CREATE TABLE public.profiles (
    id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name    TEXT,
    avatar_url      TEXT,
    preferred_lang  VARCHAR(5) DEFAULT 'en' REFERENCES public.languages(code),
    role            VARCHAR(20) NOT NULL DEFAULT 'reader'
                        CHECK (role IN ('reader', 'editor', 'admin')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.profiles IS 'Extended user profile linked to auth.users';

-- ============================================================================
-- 7. BOOKMARKS (user saves page in a book)
-- ============================================================================
CREATE TABLE public.bookmarks (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID    NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    book_id     UUID    NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
    page_number INT     NOT NULL DEFAULT 1,
    label       TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, book_id, page_number)
);

CREATE INDEX idx_bookmarks_user ON public.bookmarks(user_id);

-- ============================================================================
-- 8. READING PROGRESS
-- ============================================================================
CREATE TABLE public.reading_progress (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id         UUID   NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    book_id         UUID   NOT NULL REFERENCES public.books(id)    ON DELETE CASCADE,
    current_page    INT    NOT NULL DEFAULT 1,
    total_pages     INT,
    last_read_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, book_id)
);

-- ============================================================================
-- 9. DOWNLOAD LOG (analytics & rate-limiting)
-- ============================================================================
CREATE TABLE public.download_logs (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    book_id     UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
    user_id     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    ip_address  INET,
    user_agent  TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_download_logs_book ON public.download_logs(book_id);
CREATE INDEX idx_download_logs_date ON public.download_logs(created_at);

-- ============================================================================
-- 10. COLLECTIONS (curated reading lists)
-- ============================================================================
CREATE TABLE public.collections (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title       JSONB   NOT NULL DEFAULT '{}',
    description JSONB   DEFAULT '{}',
    cover_url   TEXT,
    is_public   BOOLEAN NOT NULL DEFAULT true,
    created_by  UUID    REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.collection_books (
    collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
    book_id       UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
    sort_order    INT  NOT NULL DEFAULT 0,
    PRIMARY KEY (collection_id, book_id)
);

-- ============================================================================
-- 11. FULL-TEXT SEARCH: Materialised helper for fast multilingual search
-- ============================================================================
CREATE OR REPLACE FUNCTION public.search_books(
    search_query TEXT,
    lang_code    TEXT DEFAULT NULL,
    cat_slug     TEXT DEFAULT NULL,
    author_era   TEXT DEFAULT NULL,
    result_limit INT  DEFAULT 20,
    result_offset INT DEFAULT 0
)
RETURNS TABLE (
    id              UUID,
    title           JSONB,
    slug            VARCHAR,
    author_name     JSONB,
    category_name   JSONB,
    cover_image_url TEXT,
    language_code   VARCHAR,
    view_count      BIGINT,
    rank            REAL
) LANGUAGE plpgsql STABLE AS $$
BEGIN
    RETURN QUERY
    SELECT
        b.id,
        b.title,
        b.slug,
        a.name  AS author_name,
        c.name  AS category_name,
        b.cover_image_url,
        b.language_code,
        b.view_count,
        -- Compute relevance by checking all language keys in JSONB
        GREATEST(
            similarity(COALESCE(b.title->>'en',''), search_query),
            similarity(COALESCE(b.title->>'ar',''), search_query),
            similarity(COALESCE(b.title->>'bn',''), search_query),
            similarity(COALESCE(b.title->>'ur',''), search_query),
            similarity(COALESCE(a.name->>'en',''),  search_query),
            similarity(COALESCE(a.name->>'ar',''),  search_query)
        )::REAL AS rank
    FROM public.books b
    JOIN public.authors    a ON a.id = b.author_id
    JOIN public.categories c ON c.id = b.category_id
    WHERE
        (search_query = '' OR
            b.title->>'en' ILIKE '%' || search_query || '%' OR
            b.title->>'ar' ILIKE '%' || search_query || '%' OR
            b.title->>'bn' ILIKE '%' || search_query || '%' OR
            b.title->>'ur' ILIKE '%' || search_query || '%' OR
            a.name->>'en'  ILIKE '%' || search_query || '%' OR
            a.name->>'ar'  ILIKE '%' || search_query || '%'
        )
        AND (lang_code IS NULL OR b.language_code = lang_code)
        AND (cat_slug  IS NULL OR c.slug = cat_slug)
        AND (author_era IS NULL OR a.era = author_era)
    ORDER BY rank DESC, b.view_count DESC
    LIMIT result_limit
    OFFSET result_offset;
END;
$$;

-- ============================================================================
-- 12. ROW-LEVEL SECURITY (RLS)
-- ============================================================================
ALTER TABLE public.books           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.download_logs   ENABLE ROW LEVEL SECURITY;

-- Books: public read, admin write
CREATE POLICY "Books are publicly readable"
    ON public.books FOR SELECT USING (true);

CREATE POLICY "Admins can manage books"
    ON public.books FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Profiles: users can read/update own
CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (id = auth.uid());

-- Bookmarks: users own their bookmarks
CREATE POLICY "Users manage own bookmarks"
    ON public.bookmarks FOR ALL
    USING (user_id = auth.uid());

-- Reading progress: users own their progress
CREATE POLICY "Users manage own reading progress"
    ON public.reading_progress FOR ALL
    USING (user_id = auth.uid());

-- ============================================================================
-- 13. HELPER: Increment view count (called from Edge Function)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.increment_view_count(book_uuid UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    UPDATE public.books
    SET view_count = view_count + 1, updated_at = now()
    WHERE id = book_uuid;
END;
$$;

-- ============================================================================
-- 14. HELPER: Increment download count + log
-- ============================================================================
CREATE OR REPLACE FUNCTION public.record_download(
    p_book_id  UUID,
    p_user_id  UUID DEFAULT NULL,
    p_ip       INET DEFAULT NULL,
    p_ua       TEXT DEFAULT NULL
)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    UPDATE public.books
    SET download_count = download_count + 1, updated_at = now()
    WHERE id = p_book_id;

    INSERT INTO public.download_logs (book_id, user_id, ip_address, user_agent)
    VALUES (p_book_id, p_user_id, p_ip, p_ua);
END;
$$;

-- ============================================================================
-- 15. TRIGGERS: auto-update updated_at
-- ============================================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_books_updated      BEFORE UPDATE ON public.books           FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_authors_updated    BEFORE UPDATE ON public.authors         FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_categories_updated BEFORE UPDATE ON public.categories      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_profiles_updated   BEFORE UPDATE ON public.profiles        FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- 16. STORAGE BUCKETS (run via Supabase Dashboard or CLI)
-- ============================================================================
-- INSERT INTO storage.buckets (id, name, public) VALUES ('books',  'books',  true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('covers', 'covers', true);
--
-- Storage policies:
-- CREATE POLICY "Public read books"  ON storage.objects FOR SELECT USING (bucket_id = 'books');
-- CREATE POLICY "Public read covers" ON storage.objects FOR SELECT USING (bucket_id = 'covers');
-- CREATE POLICY "Admin upload books" ON storage.objects FOR INSERT
--     WITH CHECK (bucket_id = 'books' AND EXISTS (
--         SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
--     ));
