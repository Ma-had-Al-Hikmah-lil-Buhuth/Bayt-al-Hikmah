// ─── Database Types (mirrors supabase/schema.sql) ───────────────────────────

/** User account */
export interface User {
	id: number;
	name: string;
	email: string;
	password: string;
	isAdmin: boolean;
	created_at: string;
	updated_at: string;
}

/** JSONB multilingual field — every supported locale key is optional */
export interface MultiLang {
	en?: string;
	ar?: string;
	bn?: string;
	ur?: string;
}

// ─── Row types ──────────────────────────────────────────────────────────────

export interface Language {
	code: string;
	name: string;
	direction: "ltr" | "rtl";
	is_active: boolean;
	created_at: string;
}

export interface Author {
	id: number;
	name: MultiLang;
	bio: MultiLang;
	birth_year: number | null;
	death_year: number | null;
	created_at: string;
	updated_at: string;
}

export interface Book {
	id: number;
	title: MultiLang;
	slug: string;
	author_id: number | null;
	translator_id: number | null;
	category_id: string;
	language_code: string;
	description: MultiLang;
	pdf_url: string;
	cover_image_url: string | null;
	page_count: number | null;
	is_downloadable: boolean;
	is_featured: boolean;
	view_count: number;
	download_count: number;
	published_at: string | null;
	created_at: string;
	updated_at: string;
}

/** Book with joined author & category rows (common query shape) */
export interface BookWithRelations extends Book {
	author: Author | null;
	translator?: Author | null;
	tags?: Tag[];
}

/** Book with translations in other languages (via book_translations junction) */
export interface BookWithTranslations extends BookWithRelations {
	translations: {
		id: number;
		title: MultiLang;
		slug: string;
		language_code: string;
	}[];
}

/** Row in the book_translations junction table */
export interface BookTranslation {
	book_a_id: number;
	book_b_id: number;
}

export interface Tag {
	id: number;
	name: MultiLang;
	slug: string;
}

export interface Bookmark {
	id: number;
	user_id: number;
	book_id: number;
	page_number: number;
	label: string | null;
	created_at: string;
}

export interface DownloadLog {
	id: number;
	book_id: number;
	user_id: number | null;
	ip_address: string | null;
	user_agent: string | null;
	created_at: string;
}

// ─── Search ─────────────────────────────────────────────────────────────────

export interface SearchResult {
	id: number;
	title: MultiLang;
	slug: string;
	author_name: MultiLang;
	category_id: string;
	cover_image_url: string | null;
	language_code: string;
	view_count: number;
	rank: number;
}

export interface SearchFilters {
	query: string;
	language?: string;
	category?: string;
	page?: number;
	limit?: number;
}

// ─── Locale (English only for now — expand later) ──────────────────────────

export type Locale = "en";
export type Direction = "ltr";

export const LOCALES: Locale[] = ["en"];

export const LOCALE_DIRECTION: Record<Locale, Direction> = {
	en: "ltr",
};

export const LOCALE_NAMES: Record<Locale, string> = {
	en: "English",
};
