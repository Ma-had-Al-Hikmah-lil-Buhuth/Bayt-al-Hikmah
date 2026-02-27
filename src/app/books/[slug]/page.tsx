import {
	ArrowLeft,
	BookOpen,
	Calendar,
	Download,
	Eye,
	Globe,
	Languages,
	Tag,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LanguageBadge } from "@/components/books/LanguageBadge";
import { PdfReaderWrapper } from "@/components/books/PdfReaderWrapper";
import { getDictionary } from "@/dictionaries";
import categories from "@/lib/categories.json";
import { sampleBooks } from "@/lib/sampleData";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { formatCount, localePath, t } from "@/lib/utils";

interface BookDetailPageProps {
	params: Promise<{ slug: string }>;
}

/* eslint-disable @typescript-eslint/no-explicit-any */

const LANG_LABELS: Record<string, string> = {
	ar: "🇸🇦 Arabic",
	en: "🇬🇧 English",
	bn: "🇧🇩 Bangla",
	ur: "🇵🇰 Urdu",
};

export default async function BookDetailPage({ params }: BookDetailPageProps) {
	const { slug } = await params;
	const dict = await getDictionary();
	const b = dict.book;
	const c = dict.common;

	let book: any = null;
	let relatedBooks: any[] = [];
	let translations: any[] = [];

	try {
		const supabase = await createServerSupabaseClient();

		const { data } = await supabase
			.from("books")
			.select("*, author:authors(*), translator:authors!books_translator_id_fkey(*)")
			.eq("slug", slug)
			.single();

		if (!data) notFound();
		book = data;

		// Increment view count (fire-and-forget)
		supabase.rpc("increment_view_count", { book_id_param: book.id }).then();

		// Fetch translations via the book_translations junction table
		// Find all books linked to this book (symmetric: could be in book_a_id or book_b_id)
		const { data: linkRows } = await supabase
			.from("book_translations")
			.select("book_a_id, book_b_id")
			.or(`book_a_id.eq.${book.id},book_b_id.eq.${book.id}`);

		if (linkRows && linkRows.length > 0) {
			const linkedIds = linkRows.map((r) =>
				r.book_a_id === book.id ? r.book_b_id : r.book_a_id
			);
			const { data: translationData } = await supabase
				.from("books")
				.select("id, title, slug, language_code, author:authors(name)")
				.in("id", linkedIds)
				.order("language_code");

			translations = translationData ?? [];
		}

		// Fetch related books (same category, different book)
		const { data: related } = await supabase
			.from("books")
			.select("*, author:authors(*)")
			.eq("category_id", book.category_id)
			.neq("id", book.id)
			.order("view_count", { ascending: false })
			.limit(4);

		relatedBooks = related ?? [];
	} catch {
		// Supabase not configured — try sample data
	}

	// Fallback to sample data
	if (!book) {
		const sampleBook = sampleBooks.find((b) => b.slug === slug);
		if (sampleBook) {
			book = sampleBook;
			relatedBooks = sampleBooks
				.filter(
					(b) =>
						b.category_id === sampleBook.category_id &&
						b.id !== sampleBook.id
				)
				.slice(0, 4);
		}
	}

	if (!book) {
		return (
			<div className="mx-auto max-w-4xl px-4 py-16 text-center">
				<BookOpen className="mx-auto h-16 w-16 text-[var(--color-text-muted)] mb-4" />
				<h1 className="text-2xl font-bold mb-2">Book Not Found</h1>
				<p className="text-[var(--color-text-muted)]">
					Connect your Supabase database and add books to view them
					here.
				</p>
				<Link
					href={localePath("/books")}
					className="mt-6 inline-flex items-center gap-2 text-[var(--color-primary)] hover:underline"
				>
					<ArrowLeft className="h-4 w-4 flip-rtl" />
					{c.backToHome}
				</Link>
			</div>
		);
	}

	const title = t(book.title);
	const authorName = t(book.author?.name);
	const category = categories.find((c: any) => c.id === book.category_id);
	const categoryName = category?.name ?? book.category_id;
	const description = t(book.description);
	const translatorName = book.translator ? t(book.translator.name) : null;

	return (
		<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
			{/* Breadcrumb */}
			<nav className="mb-6 flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
				<Link
					href={localePath("/")}
					className="hover:text-[var(--color-primary)]"
				>
					{c.home}
				</Link>
				<span>/</span>
				<Link
					href={localePath("/books")}
					className="hover:text-[var(--color-primary)]"
				>
					{c.books}
				</Link>
				<span>/</span>
				<span className="text-[var(--color-text)] line-clamp-1">
					{title}
				</span>
			</nav>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
				{/* ── Left: Cover + Meta ──────────────────────────────── */}
				<div className="lg:col-span-1 space-y-6">
					{/* Cover */}
					<div className="aspect-[3/4] relative rounded-2xl overflow-hidden bg-gradient-to-br from-[var(--color-secondary)] to-[var(--color-primary)] shadow-xl">
						{book.cover_image_url ? (
							<Image
								src={book.cover_image_url}
								alt={title}
								fill
								className="object-cover"
								sizes="(max-width: 1024px) 100vw, 33vw"
								priority
							/>
						) : (
							<div className="flex items-center justify-center h-full">
								<BookOpen className="h-20 w-20 text-white/30" />
							</div>
						)}
					</div>

					{/* Actions */}
					<div className="flex gap-3">
						<a
							href={`/api/download/${book.id}`}
							className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-colors ${
								book.is_downloadable
									? "bg-[var(--color-primary)] text-white hover:opacity-90"
									: "bg-[var(--color-border)] text-[var(--color-text-muted)] cursor-not-allowed"
							}`}
						>
							<Download className="h-4 w-4" />
							{c.download}
						</a>
					</div>

					{/* Meta cards */}
					<div className="space-y-3 text-sm">
						<div className="flex items-center gap-3 text-[var(--color-text-muted)]">
							<Eye className="h-4 w-4" />
							<span>
								{b.views}: {formatCount(book.view_count)}
							</span>
						</div>
						<div className="flex items-center gap-3 text-[var(--color-text-muted)]">
							<Download className="h-4 w-4" />
							<span>
								{b.downloads}:{" "}
								{formatCount(book.download_count)}
							</span>
						</div>
						<div className="flex items-center gap-3 text-[var(--color-text-muted)]">
							<Globe className="h-4 w-4" />
							<span>
								{b.language}:{" "}
								{book.language_code?.toUpperCase()}
							</span>
						</div>
						<div className="flex items-center gap-3 text-[var(--color-text-muted)]">
							<Tag className="h-4 w-4" />
							<Link
								href={localePath(
									`/categories/${category?.slug ?? book.category_id}`
								)}
								className="hover:text-[var(--color-primary)]"
							>
								{categoryName}
							</Link>
						</div>
						{book.page_count && (
							<div className="flex items-center gap-3 text-[var(--color-text-muted)]">
								<BookOpen className="h-4 w-4" />
								<span>
									{b.pages}: {book.page_count}
								</span>
							</div>
						)}
						{book.author?.death_year && (
							<div className="flex items-center gap-3 text-[var(--color-text-muted)]">
								<Calendar className="h-4 w-4" />
								<span>d. {book.author.death_year} AH</span>
							</div>
						)}
					</div>
				</div>

				{/* ── Right: Details + Reader ─────────────────────────── */}
				<div className="lg:col-span-2 space-y-8">
					<div>
						<h1 className="text-3xl font-bold">{title}</h1>
						{authorName && (
							<Link
								href={localePath(
									`/authors/${book.author_id}`
								)}
								className="mt-2 inline-block text-lg text-[var(--color-primary)] hover:underline"
							>
								{authorName}
							</Link>
						)}
						{translatorName && (
							<p className="text-sm text-[var(--color-text-muted)] mt-1">
								Translated by{" "}
								<Link
									href={localePath(`/authors/${book.translator_id}`)}
									className="text-[var(--color-primary)] hover:underline"
								>
									{translatorName}
								</Link>
							</p>
						)}
					</div>

					{/* Description */}
					{description && (
						<div>
							<h2 className="text-lg font-semibold mb-3">
								{b.description}
							</h2>
							<p className="text-[var(--color-text-muted)] leading-relaxed whitespace-pre-line">
								{description}
							</p>
						</div>
					)}

					{/* Read it in another language */}
					{translations.length > 0 && (
						<div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
							<div className="flex items-center gap-2 px-5 py-3 bg-[var(--color-border)]/30 border-b border-[var(--color-border)]">
								<Languages className="h-4 w-4 text-[var(--color-primary)]" />
								<h2 className="text-sm font-semibold">Read it in another language</h2>
							</div>
							<div className="p-4 flex flex-wrap gap-3">
								{translations.map((tr: any) => (
									<Link
										key={tr.id}
										href={localePath(`/books/${tr.slug}`)}
										className="inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] px-4 py-2.5 text-sm font-medium hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors"
									>
										<span>{LANG_LABELS[tr.language_code] || tr.language_code.toUpperCase()}</span>
										<span className="text-xs text-[var(--color-text-muted)]">
											{t(tr.title)}
										</span>
									</Link>
								))}
							</div>
						</div>
					)}

					{/* PDF Reader */}
					<div>
						<h2 className="text-lg font-semibold mb-4">
							{c.readOnline}
						</h2>
						<PdfReaderWrapper
							pdfUrl={book.pdf_url}
							bookId={book.id}
							dict={dict}
						/>
					</div>
				</div>
			</div>

			{/* ── Related Books ─────────────────────────────────────── */}
			{relatedBooks.length > 0 && (
				<section className="mt-16">
					<h2 className="text-2xl font-bold mb-6">
						{b.relatedBooks}
					</h2>
					<div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
						{relatedBooks.map((rb: any) => (
							<Link
								key={rb.id}
								href={localePath(`/books/${rb.slug}`)}
								className="book-card rounded-xl border border-[var(--color-border)] overflow-hidden bg-[var(--color-surface)]"
							>
								<div className="aspect-[3/4] relative bg-gradient-to-br from-[var(--color-secondary)] to-[var(--color-primary)]">
									{rb.cover_image_url ? (
										<Image
											src={rb.cover_image_url}
											alt={t(rb.title)}
											fill
											className="object-cover"
											sizes="25vw"
										/>
									) : (
										<div className="flex items-center justify-center h-full">
											<BookOpen className="h-10 w-10 text-white/40" />
										</div>
									)}
								</div>
								<div className="p-3">
									<h3 className="font-semibold text-sm line-clamp-2">
										{t(rb.title)}
									</h3>
									{rb.author?.name && (
										<p className="text-xs text-[var(--color-text-muted)] mt-1">
											{t(rb.author.name)}
										</p>
									)}
								</div>
							</Link>
						))}
					</div>
				</section>
			)}
		</div>
	);
}
