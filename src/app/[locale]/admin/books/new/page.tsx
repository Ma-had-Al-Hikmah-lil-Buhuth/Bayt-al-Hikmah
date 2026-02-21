import { getDictionary } from "@/dictionaries";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { UploadBookForm } from "@/components/admin/UploadBookForm";
import type { Locale } from "@/types/database";

export default async function NewBookPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const dict = await getDictionary(locale);

  let categories: any[] = [];
  let authors: any[] = [];

  try {
    const supabase = await createServerSupabaseClient();
    const [catRes, authRes] = await Promise.all([
      supabase.from("categories").select("*").order("sort_order"),
      supabase.from("authors").select("*").order("name"),
    ]);
    categories = catRes.data ?? [];
    authors = authRes.data ?? [];
  } catch {
    // Supabase not configured
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-8">{dict.admin.uploadBook}</h1>
      <UploadBookForm
        locale={locale}
        dict={dict}
        categories={categories}
        authors={authors}
      />
    </div>
  );
}
