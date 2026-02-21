import Link from "next/link";
import { BookOpen, Eye, Calendar, ArrowLeft } from "lucide-react";
import Image from "next/image";
import { getDictionary } from "@/dictionaries";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { localePath, t, formatCount } from "@/lib/utils";
import type { Locale } from "@/types/database";

interface AuthorDetailPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function AuthorDetailPage({
  params,
}: AuthorDetailPageProps) {
  const { locale: rawLocale, id } = await params;
  const locale = rawLocale as Locale;
  const dict = await getDictionary(locale);
  const c = dict.common;

  let author: any = null;
  let books: any[] = [];

  try {
    const supabase = await createServerSupabaseClient();

    const { data: authorData } = await supabase
      .from("authors")
      .select("*")
      .eq("id", id)
      .single();

    author = authorData;

    if (author) {
      const { data: booksData } = await supabase
        .from("books")
        .select("*, category:categories(*)")
        .eq("author_id", id)
        .order("view_count", { ascending: false });

      books = booksData ?? [];
    }
  } catch {
    // Supabase not configured
  }

  if (!author) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <p className="text-[var(--color-text-muted)]">Author not found.</p>
        <Link
          href={localePath(locale, "/authors")}
          className="mt-4 inline-flex items-center gap-2 text-[var(--color-primary)] hover:underline"
        >
          <ArrowLeft className="h-4 w-4 flip-rtl" />
          {c.authors}
        </Link>
      </div>
    );
  }

  const name = t(author.name, locale);
  const bio = t(author.bio, locale);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-10">
        <Link
          href={localePath(locale, "/authors")}
          className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] inline-flex items-center gap-1 mb-4"
        >
          <ArrowLeft className="h-4 w-4 flip-rtl" />
          {c.authors}
        </Link>

        <div className="flex items-start gap-6">
          {author.photo_url ? (
            <Image
              src={author.photo_url}
              alt={name}
              width={120}
              height={120}
              className="rounded-2xl object-cover"
            />
          ) : (
            <div className="w-[120px] h-[120px] rounded-2xl bg-[var(--color-primary)]/10 flex items-center justify-center">
              <span className="text-4xl font-bold text-[var(--color-primary)]">
                {name.charAt(0)}
              </span>
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold">{name}</h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-[var(--color-text-muted)]">
              {author.era && <span>{author.era}</span>}
              {author.death_date_hijri && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  d. {author.death_date_hijri}
                </span>
              )}
            </div>
            {bio && (
              <p className="mt-4 text-[var(--color-text-muted)] max-w-2xl leading-relaxed">
                {bio}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Books */}
      <h2 className="text-2xl font-bold mb-6">
        {c.books} ({books.length})
      </h2>
      {books.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {books.map((book: any) => (
            <Link
              key={book.id}
              href={localePath(locale, `/books/${book.slug}`)}
              className="book-card rounded-xl border border-[var(--color-border)] overflow-hidden bg-[var(--color-surface)]"
            >
              <div className="aspect-[3/4] relative bg-gradient-to-br from-[var(--color-secondary)] to-[var(--color-primary)]">
                {book.cover_image_url ? (
                  <Image
                    src={book.cover_image_url}
                    alt={t(book.title, locale)}
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
                  {t(book.title, locale)}
                </h3>
                <div className="flex items-center gap-2 mt-1 text-xs text-[var(--color-text-muted)]">
                  <Eye className="h-3 w-3" />
                  {formatCount(book.view_count)}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-[var(--color-text-muted)]">{c.noResults}</p>
      )}
    </div>
  );
}
