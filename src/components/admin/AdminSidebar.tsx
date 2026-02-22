"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  FolderOpen,
  Upload,
  UserCog,
  ChevronLeft,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Locale } from "@/types/database";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  BookOpen,
  Users,
  FolderOpen,
  Upload,
  UserCog,
};

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

interface AdminSidebarClientProps {
  navItems: NavItem[];
  locale: Locale;
  backLabel: string;
  backHref: string;
}

export function AdminSidebarClient({
  navItems,
  locale,
  backLabel,
  backHref,
}: AdminSidebarClientProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => {
    // Exact match for dashboard, prefix match for sub-pages
    if (href.endsWith("/admin")) return pathname === href;
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <>
      {/* Logo / Title */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-[var(--color-border)]">
        <div className="h-9 w-9 rounded-xl bg-[var(--color-primary)] flex items-center justify-center">
          <LayoutDashboard className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="font-bold text-sm">Admin Panel</h2>
          <p className="text-xs text-[var(--color-text-muted)]">Islamic Library</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = ICON_MAP[item.icon] || LayoutDashboard;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                active
                  ? "bg-[var(--color-primary)] text-white shadow-md"
                  : "text-[var(--color-text-muted)] hover:bg-[var(--color-border)] hover:text-[var(--color-text)]"
              )}
            >
              <Icon className="h-4.5 w-4.5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Back to site */}
      <div className="px-3 py-4 border-t border-[var(--color-border)]">
        <Link
          href={backHref}
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-border)] hover:text-[var(--color-text)] transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          {backLabel}
        </Link>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-[4.5rem] start-4 z-50 md:hidden bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-2 shadow-lg"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar - mobile */}
      <aside
        className={cn(
          "fixed inset-y-0 start-0 z-50 w-64 bg-[var(--color-surface)] border-e border-[var(--color-border)] flex flex-col transition-transform duration-300 md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full rtl:translate-x-full"
        )}
      >
        {sidebarContent}
      </aside>

      {/* Sidebar - desktop */}
      <aside className="hidden md:flex md:w-64 md:shrink-0 border-e border-[var(--color-border)] bg-[var(--color-surface)] flex-col sticky top-16 h-[calc(100vh-4rem)]">
        {sidebarContent}
      </aside>
    </>
  );
}
