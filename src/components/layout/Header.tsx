"use client";

import { BookOpen, LogOut, Menu, Search, Shield, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { localePath } from "@/lib/utils";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface HeaderProps {
	dict: any;
}

export function Header({ dict }: HeaderProps) {
	const [mobileOpen, setMobileOpen] = useState(false);
	const [isLoggedIn, setIsLoggedIn] = useState(false);
	const [isAdmin, setIsAdmin] = useState(false);
	const router = useRouter();
	const pathname = usePathname();
	const isOnAdmin = pathname.startsWith("/admin");
	const c = dict.common;

	const checkAuth = useCallback(async () => {
		try {
			const res = await fetch("/api/auth?action=me");
			if (res.ok) {
				const data = await res.json();
				setIsLoggedIn(true);
				setIsAdmin(!!data.user?.isAdmin);
			} else {
				setIsLoggedIn(false);
				setIsAdmin(false);
			}
		} catch {
			setIsLoggedIn(false);
			setIsAdmin(false);
		}
	}, []);

	useEffect(() => {
		checkAuth();

		// Listen for auth state changes (e.g. after logout)
		const onAuthChange = () => checkAuth();
		window.addEventListener("auth-change", onAuthChange);
		return () => window.removeEventListener("auth-change", onAuthChange);
	}, [checkAuth]);

	const handleLogout = async () => {
		try {
			const res = await fetch("/api/auth?action=logout", { method: "POST" });
			if (res.ok) {
				setIsLoggedIn(false);
				setIsAdmin(false);
				toast.success("Logged out successfully!");
				window.dispatchEvent(new Event("auth-change"));
				router.push("/");
				router.refresh();
			} else {
				toast.error("Failed to logout.");
			}
		} catch {
			toast.error("Failed to logout.");
		}
	};

	const navLinks = [
		{ href: localePath("/"), label: c.home },
		{ href: localePath("/books"), label: c.books },
		{ href: localePath("/categories"), label: c.categories },
		{ href: localePath("/authors"), label: c.authors },
	];

	// Hide header entirely in admin panel
	if (isOnAdmin) return null;

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

				{/* ── Desktop nav ──────────────────────────────────────── */}
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
				<div className="flex items-center gap-2">
					{/* Search */}
					<Link
						href={localePath("/books?focus=search")}
						className="p-2 rounded-lg hover:bg-[var(--color-border)] transition-colors"
						aria-label={c.search}
					>
						<Search className="h-5 w-5" />
					</Link>

					{/* Admin */}
					{isAdmin && (
						<Link
							href={localePath("/admin")}
							className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10 transition-colors"
							aria-label="Admin Panel"
							title="Admin Panel"
						>
							<Shield className="h-4.5 w-4.5" />
							<span>Admin</span>
						</Link>
					)}

					{/* Logout */}
					{isLoggedIn && (
						<button
							onClick={handleLogout}
							className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-red-500 hover:bg-red-600 transition-colors cursor-pointer"
							aria-label="Logout"
							title="Logout"
						>
							<LogOut className="h-4.5 w-4.5" />
							<span>Logout</span>
						</button>
					)}

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
					{isAdmin && (
						<Link
							href={localePath("/admin")}
							onClick={() => setMobileOpen(false)}
							className="flex items-center gap-2 text-sm font-medium text-[var(--color-primary)]"
						>
							<Shield className="h-4 w-4" />
							Admin
						</Link>
					)}
					{isLoggedIn ? (
						<button
							onClick={() => {
								setMobileOpen(false);
								handleLogout();
							}}
							className="flex items-center gap-2 text-sm font-medium text-red-500 cursor-pointer"
						>
							<LogOut className="h-4 w-4" />
							Logout
						</button>
					) : (
						<Link
							href={localePath("/auth/login")}
							onClick={() => setMobileOpen(false)}
							className="block text-sm font-medium text-[var(--color-primary)]"
						>
							{c.login}
						</Link>
					)}
				</nav>
			)}
		</header>
	);
}
