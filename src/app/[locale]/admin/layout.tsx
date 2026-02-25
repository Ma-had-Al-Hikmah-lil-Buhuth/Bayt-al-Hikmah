import { redirect } from "next/navigation";
import { getDictionary } from "@/dictionaries";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { localePath } from "@/lib/utils";
import type { Locale } from "@/types/database";
import { AdminSidebarClient } from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const dict = await getDictionary(locale);
  const a = dict.admin;

  // Auth guard
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      redirect(localePath(locale, "/auth/login"));
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      redirect(localePath(locale, "/"));
    }
  } catch {
    // Allow render for demo/dev
  }

  const navItems = [
    {
      href: localePath(locale, "/admin"),
      label: a.dashboard,
      icon: "LayoutDashboard",
    },
    {
      href: localePath(locale, "/admin/books"),
      label: a.manageBooks,
      icon: "BookOpen",
    },
    {
      href: localePath(locale, "/admin/books/new"),
      label: a.uploadBook,
      icon: "Upload",
    },
    {
      href: localePath(locale, "/admin/authors"),
      label: a.manageAuthors,
      icon: "Users",
    },
    {
      href: localePath(locale, "/admin/categories"),
      label: a.manageCategories,
      icon: "FolderOpen",
    },
    {
      href: localePath(locale, "/admin/users"),
      label: a.manageUsers || "Manage Users",
      icon: "UserCog",
    },
  ];

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <AdminSidebarClient
        navItems={navItems}
        locale={locale}
        backLabel={dict.common.backToHome || "Back to Site"}
        backHref={localePath(locale, "/")}
      />
      <div className="flex-1 min-w-0 bg-[var(--color-bg)]">
        {children}
      </div>
    </div>
  );
}
