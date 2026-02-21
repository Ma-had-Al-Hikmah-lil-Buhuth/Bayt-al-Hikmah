import Link from "next/link";
import Image from "next/image";
import {
  BookOpen,
  Download,
  Users,
  Search,
  ArrowRight,
  Star,
} from "lucide-react";
import { getDictionary } from "@/dictionaries";
import { localePath, t } from "@/lib/utils";
import type { Locale } from "@/types/database";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const dict = await getDictionary(locale);
  const h = dict.home;
  const c = dict.common;

  // Fetch featured books, categories, authors from Supabase
  let featuredBooks: any[] = [];
  let categories: any[] = [];
  let stats = { books: 0, downloads: 0, authors: 0 };

  try {
    const supabase = await createServerSupabaseClient();

    const [booksRes, catRes, authorsRes] = await Promise.all([
      supabase
        .from("books")
        .select("*, author:authors(*), category:categories(*)")
        .eq("is_featured", true)
        .order("view_count", { ascending: false })
        .limit(8),
      supabase
        .from("categories")
        .select("*")
        .order("sort_order", { ascending: true }),
      supabase.from("authors").select("id"),
    ]);

    featuredBooks = booksRes.data ?? [];
    categories = catRes.data ?? [];
    stats = {
      books: featuredBooks.length,
      downloads: 0,
      authors: authorsRes.data?.length ?? 0,
    };
  } catch {
    // Supabase not configured yet — render with empty data
  }

  return (
    <>
      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[var(--color-secondary)] via-[#1a4a7a] to-[var(--color-primary)] text-white animate-gradient">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-5" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              {h.heroTitle}
            </h1>
            <p className="mt-6 text-lg text-white/80 leading-relaxed max-w-2xl">
              {h.heroSubtitle}
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href={localePath(locale, "/books")}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-[var(--color-secondary)] shadow-lg hover:shadow-xl transition-shadow"
              >
                <Search className="h-4 w-4" />
                {h.startReading}
              </Link>
              <Link
                href={localePath(locale, "/categories")}
                className="inline-flex items-center gap-2 rounded-xl border-2 border-white/30 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
              >
                {h.browseCategories}
                <ArrowRight className="h-4 w-4 flip-rtl" />
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg">
            {[
              { icon: BookOpen, label: "Books", value: "5,000+" },
              { icon: Download, label: "Downloads", value: "100K+" },
              { icon: Users, label: "Scholars", value: "200+" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="text-center">
                <Icon className="mx-auto h-8 w-8 mb-2 text-[var(--color-accent)]" />
                <div className="text-2xl font-bold">{value}</div>
                <div className="text-sm text-white/60">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ──────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">{h.browseCategories}</h2>
          <Link
            href={localePath(locale, "/categories")}
            className="text-sm font-medium text-[var(--color-primary)] hover:underline inline-flex items-center gap-1"
          >
            {c.viewAll} <ArrowRight className="h-4 w-4 flip-rtl" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {(categories.length > 0
            ? categories
            : [
                { slug: "aqeedah", name: { en: "Aqeedah", ar: "عقيدة" } },
                { slug: "fiqh", name: { en: "Fiqh", ar: "فقه" } },
                { slug: "hadith", name: { en: "Hadith", ar: "حديث" } },
                { slug: "tafsir", name: { en: "Tafsir", ar: "تفسير" } },
                { slug: "seerah", name: { en: "Seerah", ar: "سيرة" } },
                { slug: "manhaj", name: { en: "Manhaj", ar: "منهج" } },
                { slug: "fatawa", name: { en: "Fatawa", ar: "فتاوى" } },
                { slug: "tazkiyah", name: { en: "Tazkiyah", ar: "تزكية" } },
                { slug: "history", name: { en: "History", ar: "تاريخ" } },
                {
                  slug: "arabic-language",
                  name: { en: "Arabic Language", ar: "اللغة العربية" },
                },
              ]
          ).map((cat: any) => (
            <Link
              key={cat.slug}
              href={localePath(locale, `/categories/${cat.slug}`)}
              className="category-card group rounded-xl border border-[var(--color-border)] p-5 text-center hover:shadow-md transition-all"
            >
              <BookOpen className="mx-auto h-8 w-8 mb-3 text-[var(--color-primary)] group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-sm">{t(cat.name, locale)}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Featured Books ──────────────────────────────────────── */}
      <section className="bg-[var(--color-surface)] border-y border-[var(--color-border)]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Star className="h-6 w-6 text-[var(--color-accent)]" />
              {h.featuredBooks}
            </h2>
            <Link
              href={localePath(locale, "/books")}
              className="text-sm font-medium text-[var(--color-primary)] hover:underline inline-flex items-center gap-1"
            >
              {c.viewAll} <ArrowRight className="h-4 w-4 flip-rtl" />
            </Link>
          </div>

          {featuredBooks.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredBooks.map((book: any) => (
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
                        sizes="(max-width: 640px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <BookOpen className="h-12 w-12 text-white/50" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-sm line-clamp-2">
                      {t(book.title, locale)}
                    </h3>
                    <p className="text-xs text-[var(--color-text-muted)] mt-1">
                      {t(book.author?.name, locale)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-[var(--color-text-muted)]">
              <BookOpen className="mx-auto h-16 w-16 mb-4 opacity-30" />
              <p className="text-lg">{c.noResults}</p>
              <p className="text-sm mt-2">
                Connect your Supabase database to see books here.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-gradient-to-r from-[var(--color-secondary)] to-[var(--color-primary)] p-12 text-center text-white">
          <h2 className="text-3xl font-bold">{h.startReading}</h2>
          <p className="mt-4 text-white/80 max-w-xl mx-auto">
            {h.heroSubtitle}
          </p>
          <Link
            href={localePath(locale, "/books")}
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3 text-sm font-semibold text-[var(--color-secondary)] shadow-lg hover:shadow-xl transition-shadow"
          >
            <Search className="h-4 w-4" />
            {c.search}
          </Link>
        </div>
      </section>
    </>
  );
}
