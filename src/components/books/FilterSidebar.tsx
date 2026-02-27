"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BookOpen, Filter } from "lucide-react";
import { cn, localePath, t } from "@/lib/utils";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface FilterSidebarProps {
	dict: any;
	categories: any[];
	activeCategory: string;
	activeLanguage: string;
	activeEra: string;
}

export function FilterSidebar({
	dict,
	categories,
	activeCategory,
	activeLanguage,
	activeEra,
}: FilterSidebarProps) {
	const searchParams = useSearchParams();
	const s = dict.search;

	function buildUrl(key: string, value: string) {
		const params = new URLSearchParams(searchParams.toString());
		if (value) {
			params.set(key, value);
		} else {
			params.delete(key);
		}
		params.delete("page"); // reset pagination
		return localePath(`/books?${params.toString()}`);
	}

	const eras = [
		{ value: "Classical", label: s.classical },
		{ value: "Medieval", label: s.medieval },
		{ value: "Contemporary", label: s.contemporary },
	];

	const languages = [
		{ code: "ar", label: "العربية" },
		{ code: "en", label: "English" },
		{ code: "bn", label: "বাংলা" },
		{ code: "ur", label: "اردو" },
	];

	// Fallback categories if Supabase not connected
	const displayCategories =
		categories.length > 0
			? categories
			: [
					{ slug: "aqeedah", name: { en: "Aqeedah", ar: "عقيدة" } },
					{ slug: "fiqh", name: { en: "Fiqh", ar: "فقه" } },
					{ slug: "hadith", name: { en: "Hadith", ar: "حديث" } },
					{ slug: "tafsir", name: { en: "Tafsir", ar: "تفسير" } },
					{ slug: "seerah", name: { en: "Seerah", ar: "سيرة" } },
					{ slug: "manhaj", name: { en: "Manhaj", ar: "منهج" } },
					{ slug: "fatawa", name: { en: "Fatawa", ar: "فتاوى" } },
					{ slug: "tazkiyah", name: { en: "Tazkiyah", ar: "تزكية" } },
				];

	return (
		<div className="space-y-6">
			<div className="flex items-center gap-2 text-sm font-semibold">
				<Filter className="h-4 w-4" />
				Filters
			</div>

			{/* Category filter */}
			<div>
				<h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-3">
					{s.filterByCategory}
				</h3>
				<div className="space-y-1">
					<Link
						href={buildUrl("category", "")}
						className={cn(
							"flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
							!activeCategory
								? "bg-[var(--color-primary)] text-white"
								: "hover:bg-[var(--color-border)]"
						)}
					>
						<BookOpen className="h-4 w-4" />
						All
					</Link>
					{displayCategories.map((cat: any) => (
						<Link
							key={cat.slug}
							href={buildUrl("category", cat.slug)}
							className={cn(
								"flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
								activeCategory === cat.slug
									? "bg-[var(--color-primary)] text-white"
									: "hover:bg-[var(--color-border)]"
							)}
						>
							{t(cat.name)}
						</Link>
					))}
				</div>
			</div>

			{/* Language filter */}
			<div>
				<h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-3">
					{s.filterByLanguage}
				</h3>
				<div className="space-y-1">
					<Link
						href={buildUrl("language", "")}
						className={cn(
							"block rounded-lg px-3 py-2 text-sm transition-colors",
							!activeLanguage
								? "bg-[var(--color-primary)] text-white"
								: "hover:bg-[var(--color-border)]"
						)}
					>
						All
					</Link>
					{languages.map((lang) => (
						<Link
							key={lang.code}
							href={buildUrl("language", lang.code)}
							className={cn(
								"block rounded-lg px-3 py-2 text-sm transition-colors",
								activeLanguage === lang.code
									? "bg-[var(--color-primary)] text-white"
									: "hover:bg-[var(--color-border)]"
							)}
						>
							{lang.label}
						</Link>
					))}
				</div>
			</div>

			{/* Era filter */}
			<div>
				<h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-3">
					{s.filterByEra}
				</h3>
				<div className="space-y-1">
					<Link
						href={buildUrl("era", "")}
						className={cn(
							"block rounded-lg px-3 py-2 text-sm transition-colors",
							!activeEra
								? "bg-[var(--color-primary)] text-white"
								: "hover:bg-[var(--color-border)]"
						)}
					>
						All
					</Link>
					{eras.map((e) => (
						<Link
							key={e.value}
							href={buildUrl("era", e.value)}
							className={cn(
								"block rounded-lg px-3 py-2 text-sm transition-colors",
								activeEra === e.value
									? "bg-[var(--color-primary)] text-white"
									: "hover:bg-[var(--color-border)]"
							)}
						>
							{e.label}
						</Link>
					))}
				</div>
			</div>
		</div>
	);
}
