import Link from "next/link";
import { BookOpen } from "lucide-react";
import { getDictionary } from "@/dictionaries";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { localePath, t } from "@/lib/utils";
import type { Locale } from "@/types/database";

export default async function CategoriesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const dict = await getDictionary(locale);

  let categories: any[] = [];

  try {
    const supabase = await createServerSupabaseClient();
    const { data } = await supabase
      .from("categories")
      .select("*, books:books(count)")
      .order("sort_order", { ascending: true });
    categories = data ?? [];
  } catch {
    // Fallback
    categories = [
      { slug: "aqeedah", name: { en: "Aqeedah", ar: "عقيدة" }, description: { en: "Islamic Creed & Theology" } },
      { slug: "manhaj", name: { en: "Manhaj", ar: "منهج" }, description: { en: "Methodology of the Salaf" } },
      { slug: "fiqh", name: { en: "Fiqh", ar: "فقه" }, description: { en: "Islamic Jurisprudence" } },
      { slug: "hadith", name: { en: "Hadith", ar: "حديث" }, description: { en: "Prophetic Traditions" } },
      { slug: "tafsir", name: { en: "Tafsir", ar: "تفسير" }, description: { en: "Quranic Exegesis" } },
      { slug: "seerah", name: { en: "Seerah", ar: "سيرة" }, description: { en: "Prophetic Biography" } },
      { slug: "arabic-language", name: { en: "Arabic Language", ar: "اللغة العربية" }, description: { en: "Grammar, Morphology & Rhetoric" } },
      { slug: "history", name: { en: "History", ar: "تاريخ" }, description: { en: "Islamic History & Civilisation" } },
      { slug: "fatawa", name: { en: "Fatawa", ar: "فتاوى" }, description: { en: "Scholarly Rulings & Verdicts" } },
      { slug: "tazkiyah", name: { en: "Tazkiyah", ar: "تزكية" }, description: { en: "Purification of the Soul" } },
    ];
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-2">{dict.common.categories}</h1>
      <p className="text-[var(--color-text-muted)] mb-8">
        {dict.home.browseCategories}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat: any) => (
          <Link
            key={cat.slug}
            href={localePath(locale, `/books?category=${cat.slug}`)}
            className="category-card group rounded-2xl border border-[var(--color-border)] p-6 hover:shadow-lg transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-[var(--color-primary)]/10 p-3">
                <BookOpen className="h-6 w-6 text-[var(--color-primary)]" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold group-hover:text-[var(--color-primary)] transition-colors">
                  {t(cat.name, locale)}
                </h2>
                <p className="text-sm text-[var(--color-text-muted)] mt-1">
                  {t(cat.description, locale)}
                </p>
                {cat.books && (
                  <span className="text-xs text-[var(--color-text-muted)] mt-2 inline-block">
                    {cat.books[0]?.count ?? 0} {dict.common.books.toLowerCase()}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
