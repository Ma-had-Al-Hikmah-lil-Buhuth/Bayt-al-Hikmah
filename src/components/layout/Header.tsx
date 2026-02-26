"use client";

import { BookOpen, Globe, LogIn, Menu, Search, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { cn, localePath } from "@/lib/utils";
import { LOCALE_NAMES, LOCALES, type Locale } from "@/types/database";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface HeaderProps {
	locale: Locale;
	dict: any;
}

export function Header({ locale, dict }: HeaderProps) {
	const [mobileOpen, setMobileOpen] = useState(false);
	const [langOpen, setLangOpen] = useState(false);
	const langRef = useRef<HTMLDivElement>(null); // reference to the language dropdown
	const c = dict.common;

	const navLinks = [
		{ href: localePath(locale, "/"), label: c.home },
		{ href: localePath(locale, "/books"), label: c.books },
		{ href: localePath(locale, "/categories"), label: c.categories },
		{ href: localePath(locale, "/authors"), label: c.authors },
	];

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (
				langRef.current &&
				!langRef.current.contains(event.target as Node)
			) {
				setLangOpen(false);
			}
		}

		function handleEsc(event: KeyboardEvent) {
			if (event.key === "Escape") setLangOpen(false);
		}

		document.addEventListener("mousedown", handleClickOutside);
		document.addEventListener("keydown", handleEsc);

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			document.removeEventListener("keydown", handleEsc);
		};
	}, []);

	return (
		<header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-surface)]/80 backdrop-blur-md">
			<div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
				{/* ── Logo ──────────────────────────────────────────────── */}
				<Link
					href={localePath(locale, "/")}
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
						href={localePath(locale, "/books?focus=search")}
						className="p-2 rounded-lg hover:bg-[var(--color-border)] transition-colors"
						aria-label={c.search}
					>
						<Search className="h-5 w-5" />
					</Link>

					{/* Language switcher */}
					<div className="relative" ref={langRef}>
						<button
							onClick={() => setLangOpen(!langOpen)}
							className="flex items-center gap-1 p-2 rounded-lg hover:bg-[var(--color-border)] transition-colors text-sm"
							aria-label={c.language}
						>
							<Globe className="h-5 w-5" />
							<span className="hidden sm:inline uppercase">
								{locale}
							</span>
						</button>
						{langOpen && (
							<div className="absolute end-0 mt-2 w-40 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg py-1 z-50">
								{LOCALES.map((loc) => (
									<Link
										key={loc}
										href={`/${loc}`}
										onClick={() => setLangOpen(false)}
										className={cn(
											"block px-4 py-2 text-sm hover:bg-[var(--color-border)] transition-colors",
											loc === locale &&
												"font-semibold text-[var(--color-primary)]"
										)}
									>
										{LOCALE_NAMES[loc]}
									</Link>
								))}
							</div>
						)}
					</div>

					{/* Login */}
					{/* <Link */}
					{/* 	href={localePath(locale, "/auth/login")} */}
					{/* 	className="hidden sm:flex items-center gap-1 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity" */}
					{/* > */}
					{/* 	<LogIn className="h-4 w-4" /> */}
					{/* 	{c.login} */}
					{/* </Link> */}

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
						href={localePath(locale, "/auth/login")}
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
