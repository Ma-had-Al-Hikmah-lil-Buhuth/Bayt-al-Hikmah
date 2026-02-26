import Link from "next/link";
import Image from "next/image";
import { BookOpen, Eye, Download, ArrowLeft } from "lucide-react";
import { getDictionary } from "@/dictionaries";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { localePath, t, formatCount } from "@/lib/utils";
import type { Locale } from "@/types/database";
import {
	sampleCategories,
	sampleBooks,
	getSampleBooksByCategory,
} from "@/lib/sampleData";

interface CategoryDetailPageProps {
	params: Promise<{ locale: string; slug: string }>;
}

export default async function CategoryDetailPage({
	params,
}: CategoryDetailPageProps) {
	const { locale: rawLocale, slug } = await params;
	const locale = rawLocale as Locale;
	const dict = await getDictionary(locale);
	const c = dict.common;

	let category: any = null;
	let books: any[] = [];

	try {
		const supabase = await createServerSupabaseClient();

		const { data: catData } = await supabase
			.from("categories")
			.select("*")
			.eq("slug", slug)
			.single();

		category = catData;

		if (category) {
			const { data: booksData } = await supabase
				.from("books")
				.select("*, author:authors(*), category:categories(*)")
				.eq("category_id", category.id)
				.order("view_count", { ascending: false });

			books = booksData ?? [];
		}
	} catch {
		// Supabase not configured
	}

	// Fallback to sample data
	if (!category) {
		const sampleCat = sampleCategories.find((sc) => sc.slug === slug);
		if (sampleCat) {
			category = sampleCat;
			books = getSampleBooksByCategory(slug);
		}
	}

	if (!category) {
		return (
			<div className="mx-auto max-w-4xl px-4 py-16 text-center">
				<BookOpen className="mx-auto h-16 w-16 text-[var(--color-text-muted)] mb-4 opacity-30" />
				<h1 className="text-2xl font-bold mb-2">Category Not Found</h1>
				<p className="text-[var(--color-text-muted)]">
					The category you are looking for does not exist.
				</p>
				<Link
					href={localePath(locale, "/categories")}
					className="mt-6 inline-flex items-center gap-2 text-[var(--color-primary)] hover:underline"
				>
					<ArrowLeft className="h-4 w-4 flip-rtl" />
					{c.categories}
				</Link>
			</div>
		);
	}

	const categoryName = t(category.name, locale);
	const categoryDesc = t(category.description, locale);

	return (
		<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
			{/* Breadcrumb */}
			<nav className="mb-6 flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
				<Link
					href={localePath(locale, "/")}
					className="hover:text-[var(--color-primary)]"
				>
					{c.home}
				</Link>
				<span>/</span>
				<Link
					href={localePath(locale, "/categories")}
					className="hover:text-[var(--color-primary)]"
				>
					{c.categories}
				</Link>
				<span>/</span>
				<span className="text-[var(--color-text)]">{categoryName}</span>
			</nav>

			{/* Category Header */}
			<div className="mb-10">
				<div className="flex items-center gap-4">
					<div className="rounded-2xl bg-[var(--color-primary)]/10 p-4">
						<BookOpen className="h-8 w-8 text-[var(--color-primary)]" />
					</div>
					<div>
						<h1 className="text-3xl font-bold">{categoryName}</h1>
						{categoryDesc && (
							<p className="text-[var(--color-text-muted)] mt-1">
								{categoryDesc}
							</p>
						)}
						<p className="text-sm text-[var(--color-text-muted)] mt-2">
							{books.length} {c.books.toLowerCase()}
						</p>
					</div>
				</div>
			</div>

			{/* Books Grid */}
			{books.length > 0 ? (
				<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
					{books.map((book: any) => {
						const title = t(book.title, locale);
						const authorName = t(
							book.author?.name ?? book.author_name,
							locale
						);
						const bookSlug = book.slug ?? book.id;

						return (
							<Link
								key={book.id}
								href={localePath(locale, `/books/${bookSlug}`)}
								className="book-card group rounded-xl border border-[var(--color-border)] overflow-hidden bg-[var(--color-surface)]"
							>
								{/* Cover */}
								<div className="aspect-[3/4] relative bg-gradient-to-br from-[var(--color-secondary)] to-[var(--color-primary)]">
									{book.cover_image_url ? (
										<Image
											src={book.cover_image_url}
											alt={title}
											fill
											className="object-cover group-hover:scale-105 transition-transform duration-300"
											sizes="(max-width: 640px) 50vw, 25vw"
										/>
									) : (
										<div className="flex items-center justify-center h-full">
											<BookOpen className="h-12 w-12 text-white/40" />
										</div>
									)}

									{/* Language Badge */}
									{book.language_code && (
										<span className="absolute top-2 end-2 rounded-md bg-black/60 px-2 py-0.5 text-xs text-white uppercase">
											{book.language_code}
										</span>
									)}
								</div>

								{/* Info */}
								<div className="p-3 space-y-1">
									<h3 className="font-semibold text-sm line-clamp-2 leading-snug">
										{title}
									</h3>
									<p className="text-xs text-[var(--color-text-muted)] line-clamp-1">
										{authorName}
									</p>
									<div className="flex items-center gap-3 text-xs text-[var(--color-text-muted)] pt-1">
										<span className="flex items-center gap-1">
											<Eye className="h-3 w-3" />
											{formatCount(book.view_count ?? 0)}
										</span>
										<span className="flex items-center gap-1">
											<Download className="h-3 w-3" />
											{formatCount(
												book.download_count ?? 0
											)}
										</span>
									</div>
								</div>
							</Link>
						);
					})}
				</div>
			) : (
				<div className="text-center py-16 text-[var(--color-text-muted)]">
					<BookOpen className="mx-auto h-16 w-16 mb-4 opacity-30" />
					<p className="text-lg">{c.noResults}</p>
					<p className="text-sm mt-2">
						No books in this category yet.
					</p>
				</div>
			)}

			{/* Browse other categories */}
			<div className="mt-16 border-t border-[var(--color-border)] pt-8">
				<h2 className="text-xl font-bold mb-4">
					{dict.home.browseCategories}
				</h2>
				<div className="flex flex-wrap gap-3">
					{sampleCategories
						.filter((sc) => sc.slug !== slug)
						.map((sc) => (
							<Link
								key={sc.slug}
								href={localePath(
									locale,
									`/categories/${sc.slug}`
								)}
								className="rounded-full border border-[var(--color-border)] px-4 py-2 text-sm hover:bg-[var(--color-primary)] hover:text-white hover:border-[var(--color-primary)] transition-colors"
							>
								{t(sc.name, locale)}
							</Link>
						))}
				</div>
			</div>
		</div>
	);
}
