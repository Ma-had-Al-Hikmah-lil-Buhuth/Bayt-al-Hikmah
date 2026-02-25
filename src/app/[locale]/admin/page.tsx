import { redirect } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  Upload,
  Users,
  FolderOpen,
  BarChart3,
  Eye,
  Download,
} from "lucide-react";
import { getDictionary } from "@/dictionaries";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { localePath, formatCount } from "@/lib/utils";
import type { Locale } from "@/types/database";

export default async function AdminDashboard({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale as Locale;
  const dict = await getDictionary(locale);
  const a = dict.admin;

  // Check if user is admin
  let isAdmin = false;
  let stats = {
    totalBooks: 0,
    totalViews: 0,
    totalDownloads: 0,
    totalAuthors: 0,
  };

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

    isAdmin = true;

    // Fetch stats
    const [booksRes, authorsRes] = await Promise.all([
      supabase
        .from("books")
        .select("view_count, download_count"),
      supabase.from("authors").select("id"),
    ]);

    const books = booksRes.data ?? [];
    stats.totalBooks = books.length;
    stats.totalViews = books.reduce((s, b) => s + (b.view_count ?? 0), 0);
    stats.totalDownloads = books.reduce(
      (s, b) => s + (b.download_count ?? 0),
      0,
    );
    stats.totalAuthors = authorsRes.data?.length ?? 0;
  } catch {
    // Allow render for demo purposes
    isAdmin = true;
  }

  const statCards = [
    {
      label: a.totalBooks,
      value: formatCount(stats.totalBooks),
      icon: BookOpen,
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: a.totalViews,
      value: formatCount(stats.totalViews),
      icon: Eye,
      color: "text-green-600 bg-green-50",
    },
    {
      label: a.totalDownloads,
      value: formatCount(stats.totalDownloads),
      icon: Download,
      color: "text-purple-600 bg-purple-50",
    },
    {
      label: a.manageAuthors,
      value: formatCount(stats.totalAuthors),
      icon: Users,
      color: "text-orange-600 bg-orange-50",
    },
  ];

  const quickActions = [
    {
      href: localePath(locale, "/admin/books/new"),
      label: a.uploadBook,
      icon: Upload,
      desc: "Upload a new PDF and add metadata.",
    },
    {
      href: localePath(locale, "/admin/books"),
      label: a.manageBooks,
      icon: BookOpen,
      desc: "Edit, delete, or feature existing books.",
    },
    {
      href: localePath(locale, "/admin/authors"),
      label: a.manageAuthors,
      icon: Users,
      desc: "Add or edit scholar profiles.",
    },
    {
      href: localePath(locale, "/admin/categories"),
      label: a.manageCategories,
      icon: FolderOpen,
      desc: "Organize book categories.",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <BarChart3 className="h-8 w-8 text-[var(--color-primary)]" />
          {a.dashboard}
        </h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6"
          >
            <div className="flex items-center gap-4">
              <div className={`rounded-xl p-3 ${color}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-sm text-[var(--color-text-muted)]">
                  {label}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {quickActions.map(({ href, label, icon: Icon, desc }) => (
          <Link
            key={href}
            href={href}
            className="group rounded-2xl border border-[var(--color-border)] p-6 hover:shadow-lg hover:border-[var(--color-primary)] transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-[var(--color-primary)]/10 p-3 group-hover:bg-[var(--color-primary)] group-hover:text-white transition-colors">
                <Icon className="h-6 w-6 text-[var(--color-primary)] group-hover:text-white" />
              </div>
              <div>
                <h3 className="font-semibold group-hover:text-[var(--color-primary)] transition-colors">
                  {label}
                </h3>
                <p className="text-sm text-[var(--color-text-muted)] mt-1">
                  {desc}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
