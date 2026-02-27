"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { localePath } from "@/lib/utils";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface SearchBarProps {
	dict: any;
	initialQuery: string;
	initialSort: string;
}

export function SearchBar({
	dict,
	initialQuery,
	initialSort,
}: SearchBarProps) {
	const router = useRouter();
	const [query, setQuery] = useState(initialQuery);
	const s = dict.search;

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		const params = new URLSearchParams();
		if (query) params.set("q", query);
		if (initialSort !== "relevance") params.set("sort", initialSort);
		router.push(localePath(`/books?${params.toString()}`));
	}

	function handleSortChange(sort: string) {
		const params = new URLSearchParams(window.location.search);
		params.set("sort", sort);
		router.push(localePath(`/books?${params.toString()}`));
	}

	return (
		<div className="flex flex-col sm:flex-row gap-4">
			<form onSubmit={handleSubmit} className="flex-1 relative">
				<Search className="absolute start-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--color-text-muted)]" />
				<input
					type="text"
					value={query}
					onChange={(e) => setQuery(e.target.value)}
					placeholder={s.placeholder}
					className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] py-3 ps-12 pe-4 text-sm placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-shadow"
				/>
			</form>

			{/* Sort dropdown */}
			<div className="flex items-center gap-2">
				<SlidersHorizontal className="h-4 w-4 text-[var(--color-text-muted)]" />
				<select
					value={initialSort}
					onChange={(e) => handleSortChange(e.target.value)}
					className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
				>
					<option value="relevance">{s.relevance}</option>
					<option value="views">{s.mostViewed}</option>
					<option value="newest">{s.newest}</option>
				</select>
			</div>
		</div>
	);
}
