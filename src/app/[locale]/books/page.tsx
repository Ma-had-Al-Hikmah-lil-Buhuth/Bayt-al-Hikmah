import { Suspense } from "react";
import { BooksGrid } from "@/components/books/BooksGrid";
import { FilterSidebar } from "@/components/books/FilterSidebar";
import { SearchBar } from "@/components/books/SearchBar";
import { getDictionary } from "@/dictionaries";
import {
	getSampleBooksByCategory,
	sampleBooks,
	sampleCategories,
	searchSampleBooks,
} from "@/lib/sampleData";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Locale } from "@/types/database";

interface BooksPageProps {
	params: Promise<{ locale: string }>;
	searchParams: Promise<{
		q?: string;
		category?: string;
		language?: string;
		era?: string;
		page?: string;
		sort?: string;
	}>;
}

export default async function BooksPage({
	params,
	searchParams,
}: BooksPageProps) {
	const { locale: rawLocale } = await params;
	const locale = rawLocale as Locale;
	const sp = await searchParams;
	const dict = await getDictionary(locale);

	const query = sp.q ?? "";
	const category = sp.category ?? "";
	const language = sp.language ?? "";
	const era = sp.era ?? "";
	const page = parseInt(sp.page ?? "1", 10);
	const sort = sp.sort ?? "relevance";
	const limit = 20;

	let books: any[] = [];
	let categories: any[] = [];
	let totalCount = 0;

	try {
		const supabase = await createServerSupabaseClient();

		// Fetch categories for the filter sidebar
		const catRes = await supabase
			.from("categories")
			.select("*")
			.order("sort_order", { ascending: true });
		categories = catRes.data ?? [];

		if (query) {
			// Use the search function
			const { data } = await supabase.rpc("search_books", {
				search_query: query,
				lang_code: language || null,
				cat_slug: category || null,
				author_era: era || null,
				result_limit: limit,
				result_offset: (page - 1) * limit,
			});
			books = data ?? [];
			totalCount = books.length; // approximate
		} else {
			// Regular listing with filters
			let qb = supabase
				.from("books")
				.select("*, author:authors(*), category:categories(*)", {
					count: "exact",
				});

			if (category) {
				qb = qb.eq("category.slug", category);
			}
			if (language) {
				qb = qb.eq("language_code", language);
			}

			// Sort
			if (sort === "views") {
				qb = qb.order("view_count", { ascending: false });
			} else if (sort === "newest") {
				qb = qb.order("created_at", { ascending: false });
			} else {
				qb = qb.order("view_count", { ascending: false });
			}

			qb = qb.range((page - 1) * limit, page * limit - 1);
			const { data, count } = await qb;
			books = data ?? [];
			totalCount = count ?? 0;
		}
	} catch {
		// Supabase not configured
	}

	// Fallback to sample data when Supabase is empty / not configured
	if (categories.length === 0) {
		categories = sampleCategories;
	}
	if (books.length === 0) {
		let fallbackBooks = [...sampleBooks];

		if (query) {
			fallbackBooks = searchSampleBooks(query);
		}
		if (category) {
			fallbackBooks = fallbackBooks.filter(
				(b) => b.category?.slug === category
			);
		}
		if (language) {
			fallbackBooks = fallbackBooks.filter(
				(b) => b.language_code === language
			);
		}
		if (era) {
			fallbackBooks = fallbackBooks.filter(
				(b) => b.author && sampleBooks.find((sb) => sb.id === b.id)
			);
		}

		// Sort
		if (sort === "views") {
			fallbackBooks.sort(
				(a, b) => (b.view_count ?? 0) - (a.view_count ?? 0)
			);
		} else if (sort === "newest") {
			fallbackBooks.sort(
				(a, b) =>
					new Date(b.created_at).getTime() -
					new Date(a.created_at).getTime()
			);
		}

		totalCount = fallbackBooks.length;
		books = fallbackBooks.slice((page - 1) * limit, page * limit);
	}

	const totalPages = Math.ceil(totalCount / limit) || 1;

	return (
		<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
			<h1 className="text-3xl font-bold mb-8">{dict.common.books}</h1>

			{/* Search */}
			<SearchBar
				locale={locale}
				dict={dict}
				initialQuery={query}
				initialSort={sort}
			/>

			<div className="mt-8 flex flex-col lg:flex-row gap-8">
				{/* Sidebar Filters */}
				<aside className="w-full lg:w-64 shrink-0">
					<FilterSidebar
						locale={locale}
						dict={dict}
						categories={categories}
						activeCategory={category}
						activeLanguage={language}
						activeEra={era}
					/>
				</aside>

				{/* Books Grid */}
				<div className="flex-1">
					<Suspense
						fallback={
							<div className="text-center py-12 text-[var(--color-text-muted)]">
								{dict.common.loading}
							</div>
						}
					>
						<BooksGrid
							locale={locale}
							dict={dict}
							books={books}
							currentPage={page}
							totalPages={totalPages}
							searchQuery={query}
						/>
					</Suspense>
				</div>
			</div>
		</div>
	);
}
