import Link from "next/link";
import Image from "next/image";
import {
  BookOpen,
  Eye,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { localePath, t, formatCount } from "@/lib/utils";
import type { Locale } from "@/types/database";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface BooksGridProps {
  locale: Locale;
  dict: any;
  books: any[];
  currentPage: number;
  totalPages: number;
  searchQuery: string;
}

export function BooksGrid({
  locale,
  dict,
  books,
  currentPage,
  totalPages,
  searchQuery,
}: BooksGridProps) {
  const c = dict.common;
  const s = dict.search;

  if (books.length === 0) {
    return (
      <div className="text-center py-16 text-[var(--color-text-muted)]">
        <BookOpen className="mx-auto h-16 w-16 mb-4 opacity-30" />
        <p className="text-lg">{c.noResults}</p>
        {searchQuery && (
          <p className="text-sm mt-2">
            {s.resultsFor}: &quot;{searchQuery}&quot;
          </p>
        )}
      </div>
    );
  }

  return (
    <>
      {searchQuery && (
        <p className="mb-4 text-sm text-[var(--color-text-muted)]">
          {s.resultsFor}: &quot;{searchQuery}&quot;
        </p>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
        {books.map((book: any) => {
          const title = t(book.title, locale);
          const authorName = t(
            book.author?.name ?? book.author_name,
            locale,
          );
          const slug = book.slug ?? book.id;

          return (
            <Link
              key={book.id}
              href={localePath(locale, `/books/${slug}`)}
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

                {/* Badge */}
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
                    {formatCount(book.download_count ?? 0)}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          {currentPage > 1 && (
            <Link
              href={localePath(
                locale,
                `/books?page=${currentPage - 1}${searchQuery ? `&q=${searchQuery}` : ""}`,
              )}
              className="flex items-center gap-1 rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm hover:bg-[var(--color-border)] transition-colors"
            >
              <ChevronLeft className="h-4 w-4 flip-rtl" />
              {dict.book.previousPage}
            </Link>
          )}

          <span className="px-4 py-2 text-sm text-[var(--color-text-muted)]">
            {dict.book.page} {currentPage} {dict.book.of} {totalPages}
          </span>

          {currentPage < totalPages && (
            <Link
              href={localePath(
                locale,
                `/books?page=${currentPage + 1}${searchQuery ? `&q=${searchQuery}` : ""}`,
              )}
              className="flex items-center gap-1 rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm hover:bg-[var(--color-border)] transition-colors"
            >
              {dict.book.nextPage}
              <ChevronRight className="h-4 w-4 flip-rtl" />
            </Link>
          )}
        </div>
      )}
    </>
  );
}
