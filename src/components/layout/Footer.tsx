import { BookOpen } from "lucide-react";
import Link from "next/link";
import { localePath } from "@/lib/utils";
import type { Locale } from "@/types/database";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface FooterProps {
	locale: Locale;
	dict: any;
}

export function Footer({ locale, dict }: FooterProps) {
	const c = dict.common;
	const year = new Date().getFullYear();

	return (
		<footer className="border-t border-[var(--color-border)] bg-[var(--color-surface)]">
			<div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
				<div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
					{/* Brand */}
					<div className="space-y-4">
						<Link
							href={localePath(locale, "/")}
							className="flex items-center gap-2 text-lg font-bold text-[var(--color-primary)]"
						>
							<BookOpen className="h-6 w-6" />
							{c.siteName}
						</Link>
						<p className="text-sm text-[var(--color-text-muted)] max-w-xs">
							{dict.home.heroSubtitle}
						</p>
					</div>

					{/* Quick Links */}
					<div>
						<h3 className="text-sm font-semibold uppercase tracking-wider mb-4">
							{c.books}
						</h3>
						<ul className="space-y-2">
							{[
								"aqeedah",
								"fiqh",
								"hadith",
								"tafsir",
								"seerah",
							].map((slug) => (
								<li key={slug}>
									<Link
										href={localePath(
											locale,
											`/categories/${slug}`
										)}
										className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors capitalize"
									>
										{slug}
									</Link>
								</li>
							))}
						</ul>
					</div>

					{/* Authors */}
					<div>
						<h3 className="text-sm font-semibold uppercase tracking-wider mb-4">
							{c.authors}
						</h3>
						<ul className="space-y-2 text-sm text-[var(--color-text-muted)]">
							<li>Ibn Taymiyyah</li>
							<li>Ibn al-Qayyim</li>
							<li>Shaykh Ibn Baz</li>
							<li>Shaykh al-Uthaymeen</li>
							<li>Shaykh al-Albani</li>
						</ul>
					</div>

					{/* About */}
					<div>
						<h3 className="text-sm font-semibold uppercase tracking-wider mb-4">
							{c.about}
						</h3>
						<ul className="space-y-2">
							<li>
								<Link
									href={localePath(locale, "/about")}
									className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)] transition-colors"
								>
									{c.about}
								</Link>
							</li>
						</ul>
					</div>
				</div>

				<div className="mt-12 border-t border-[var(--color-border)] pt-8 text-center text-sm text-[var(--color-text-muted)]">
					© {year} {c.siteName}. {c.allRightsReserved}
				</div>
			</div>
		</footer>
	);
}
