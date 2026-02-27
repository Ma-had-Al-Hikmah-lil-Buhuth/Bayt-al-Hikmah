"use client";

import { BookOpen, LogIn, Menu, Search, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { cn, localePath } from "@/lib/utils";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface HeaderProps {
	dict: any;
}

export function Header({ dict }: HeaderProps) {
	const [mobileOpen, setMobileOpen] = useState(false);
	const c = dict.common;

	const navLinks = [
		{ href: localePath("/"), label: c.home },
		{ href: localePath("/books"), label: c.books },
		{ href: localePath("/categories"), label: c.categories },
		{ href: localePath("/authors"), label: c.authors },
	];

	return (
		<header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-surface)]/80 backdrop-blur-md">
			<div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
				{/* ── Logo ──────────────────────────────────────────────── */}
				<Link
					href={localePath("/")}
					className="flex items-center gap-2 text-lg font-bold text-[var(--color-primary)]"
				>
					<BookOpen className="h-6 w-6" />
					<span className="hidden sm:inline">{c.siteName}</span>
				</Link>

				{/* ── Desktop nav ───────────────────────────────────────── */}
				<nav className="hidden md:flex items-center gap-6">
					{navLinks.map((link) => (
						<Link
							key={link.href}
							href={link.href}
							className="text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
						>
							{link.label}
						</Link>
					))}
				</nav>

				{/* ── Actions ───────────────────────────────────────────── */}
				<div className="flex items-center gap-3">
					{/* Search */}
					<Link
						href={localePath("/books?focus=search")}
						className="p-2 rounded-lg hover:bg-[var(--color-border)] transition-colors"
						aria-label={c.search}
					>
						<Search className="h-5 w-5" />
					</Link>

					{/* Mobile toggle */}
					<button
						onClick={() => setMobileOpen(!mobileOpen)}
						className="md:hidden p-2 rounded-lg hover:bg-[var(--color-border)]"
						aria-label="Toggle menu"
					>
						{mobileOpen ? (
							<X className="h-5 w-5" />
						) : (
							<Menu className="h-5 w-5" />
						)}
					</button>
				</div>
			</div>

			{/* ── Mobile menu ─────────────────────────────────────────── */}
			{mobileOpen && (
				<nav className="md:hidden border-t border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-4 space-y-3">
					{navLinks.map((link) => (
						<Link
							key={link.href}
							href={link.href}
							onClick={() => setMobileOpen(false)}
							className="block text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"
						>
							{link.label}
						</Link>
					))}
					<Link
						href={localePath("/auth/login")}
						onClick={() => setMobileOpen(false)}
						className="block text-sm font-medium text-[var(--color-primary)]"
					>
						{c.login}
					</Link>
				</nav>
			)}
		</header>
	);
}
