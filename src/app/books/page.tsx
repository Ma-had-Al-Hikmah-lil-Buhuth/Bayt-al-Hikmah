import { Suspense } from "react";
import { BooksGrid } from "@/components/books/BooksGrid";
import { FilterSidebar } from "@/components/books/FilterSidebar";
import { SearchBar } from "@/components/books/SearchBar";
import { getDictionary } from "@/dictionaries";
import categoriesJson from "@/lib/categories.json";
import {
	getSampleBooksByCategory,
	sampleBooks,
	searchSampleBooks,
} from "@/lib/sampleData";
import { createServerSupabaseClient } from "@/lib/supabase/server";

interface BooksPageProps {
	searchParams: Promise<{
		q?: string;
		category?: string;
		language?: string;
		page?: string;
		sort?: string;
	}>;
}

export default async function BooksPage({
	searchParams,
}: BooksPageProps) {
	const sp = await searchParams;
	const dict = await getDictionary();

	const query = sp.q ?? "";
	const category = sp.category ?? "";
	const language = sp.language ?? "";
	const page = parseInt(sp.page ?? "1", 10);
	const sort = sp.sort ?? "relevance";
	const limit = 20;

	let books: any[] = [];
	let categories: any[] = categoriesJson;
	let totalCount = 0;

	try {
		const supabase = await createServerSupabaseClient();

		if (query) {
			// Use the search function
			const { data } = await supabase.rpc("search_books", {
				search_query: query,
				lang_code: language || null,
				cat_id: category || null,
				result_limit: limit,
				result_offset: (page - 1) * limit,
			});
			books = data ?? [];
			totalCount = books.length; // approximate
		} else {
			// Regular listing with filters
			let qb = supabase
				.from("books")
				.select("*, author:authors(*)", {
					count: "exact",
				});

			if (category) {
				qb = qb.eq("category_id", category);
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

	if (books.length === 0) {
		let fallbackBooks = [...sampleBooks];

		if (query) {
			fallbackBooks = searchSampleBooks(query);
		}
		if (category) {
			fallbackBooks = fallbackBooks.filter(
				(b) => b.category_id === category
			);
		}
		if (language) {
			fallbackBooks = fallbackBooks.filter(
				(b) => b.language_code === language
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
				dict={dict}
				initialQuery={query}
				initialSort={sort}
			/>

			<div className="mt-8 flex flex-col lg:flex-row gap-8">
				{/* Sidebar Filters */}
				<aside className="w-full lg:w-64 shrink-0">
					<FilterSidebar
						dict={dict}
						categories={categories}
						activeCategory={category}
						activeLanguage={language}
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
