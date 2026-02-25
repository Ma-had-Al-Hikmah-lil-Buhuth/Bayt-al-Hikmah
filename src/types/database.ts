// ─── Database Types (mirrors supabase/schema.sql) ───────────────────────────

/** JSONB multilingual field — every supported locale key is optional */
export interface MultiLang {
  en?: string;
  ar?: string;
  bn?: string;
  ur?: string;
}

// ─── Row types ──────────────────────────────────────────────────────────────

export interface Language {
  id: string;
  code: string;
  name: MultiLang;
  direction: "ltr" | "rtl";
  is_active: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  name: MultiLang;
  slug: string;
  description: MultiLang;
  icon_url: string | null;
  sort_order: number;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Author {
  id: string;
  name: MultiLang;
  bio: MultiLang;
  era: string | null;
  birth_date_hijri: string | null;
  death_date_hijri: string | null;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
}

export type CopyrightStatus = "public_domain" | "permission_granted" | "restricted";

export interface Book {
  id: string;
  title: MultiLang;
  slug: string;
  author_id: string;
  category_id: string;
  language_code: string;
  description: MultiLang;
  pdf_url: string;
  cover_image_url: string | null;
  page_count: number | null;
  is_downloadable: boolean;
  is_featured: boolean;
  copyright: CopyrightStatus;
  view_count: number;
  download_count: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

/** Book with joined author & category rows (common query shape) */
export interface BookWithRelations extends Book {
  author: Author;
  category: Category;
}

export interface Tag {
  id: string;
  name: MultiLang;
  slug: string;
}

export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  preferred_lang: string;
  role: "reader" | "editor" | "admin";
  created_at: string;
  updated_at: string;
}

export interface Bookmark {
  id: string;
  user_id: string;
  book_id: string;
  page_number: number;
  label: string | null;
  created_at: string;
}

export interface ReadingProgress {
  id: string;
  user_id: string;
  book_id: string;
  current_page: number;
  total_pages: number | null;
  last_read_at: string;
}

export interface DownloadLog {
  id: string;
  book_id: string;
  user_id: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface Collection {
  id: string;
  title: MultiLang;
  description: MultiLang;
  cover_url: string | null;
  is_public: boolean;
  created_by: string | null;
  created_at: string;
}

// ─── Search ─────────────────────────────────────────────────────────────────

export interface SearchResult {
  id: string;
  title: MultiLang;
  slug: string;
  author_name: MultiLang;
  category_name: MultiLang;
  cover_image_url: string | null;
  language_code: string;
  view_count: number;
  rank: number;
}

export interface SearchFilters {
  query: string;
  language?: string;
  category?: string;
  era?: string;
  page?: number;
  limit?: number;
}

// ─── Locale ─────────────────────────────────────────────────────────────────

export type Locale = "en" | "ar" | "bn" | "ur";
export type Direction = "ltr" | "rtl";

export const LOCALES: Locale[] = ["en", "ar", "bn", "ur"];

export const LOCALE_DIRECTION: Record<Locale, Direction> = {
  en: "ltr",
  ar: "rtl",
  bn: "ltr",
  ur: "rtl",
};

export const LOCALE_NAMES: Record<Locale, string> = {
  en: "English",
  ar: "العربية",
  bn: "বাংলা",
  ur: "اردو",
};
