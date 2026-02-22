import { getDictionary } from "@/dictionaries";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ManageUsersClient } from "@/components/admin/ManageUsersClient";
import type { Locale } from "@/types/database";

export default async function ManageUsersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const dict = await getDictionary(locale);

  let users: any[] = [];

  try {
    const supabase = await createServerSupabaseClient();
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    users = data ?? [];
  } catch {
    // Supabase not configured
  }

  return (
    <ManageUsersClient
      locale={locale}
      dict={dict}
      initialUsers={users}
    />
  );
}
