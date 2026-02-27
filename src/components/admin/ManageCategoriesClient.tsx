"use client";

import { useState } from "react";
import { Search, FolderOpen, Info } from "lucide-react";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface ManageCategoriesClientProps {
	dict: any;
	initialCategories: any[];
}

export function ManageCategoriesClient({
	dict,
	initialCategories,
}: ManageCategoriesClientProps) {
	const [search, setSearch] = useState("");
	const a = dict.admin;

	const filtered = initialCategories.filter((cat: any) => {
		const name = (cat.name || "").toLowerCase();
		return !search || name.includes(search.toLowerCase());
	});

	return (
		<div className="px-4 py-8 sm:px-6 lg:px-8">
			{/* Header */}
			<div className="mb-6">
				<h1 className="text-2xl font-bold flex items-center gap-2">
					<FolderOpen className="h-6 w-6 text-[var(--color-primary)]" />
					{a.manageCategories}
				</h1>
				<p className="text-sm text-[var(--color-text-muted)] mt-1">
					{initialCategories.length} categories
				</p>
			</div>

			{/* Info Banner */}
			<div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 mb-6">
				<Info className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
				<div>
					<p className="text-sm font-medium text-blue-800">
						Categories are managed via the{" "}
						<code className="px-1 py-0.5 rounded bg-blue-100 text-xs font-mono">
							categories.json
						</code>{" "}
						file.
					</p>
					<p className="text-xs text-blue-600 mt-1">
						To add, edit, or remove categories, update the JSON file
						directly and redeploy.
					</p>
				</div>
			</div>

			{/* Search */}
			<div className="relative max-w-md mb-6">
				<Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
				<input
					type="text"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					placeholder="Search categories..."
					className="w-full ps-10 pe-4 py-2.5 rounded-xl border border-[var(--color-border)] text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none bg-[var(--color-surface)]"
				/>
			</div>

			{/* Categories List */}
			<div className="rounded-2xl border border-[var(--color-border)] overflow-hidden bg-[var(--color-surface)]">
				<div className="divide-y divide-[var(--color-border)]">
					{filtered.length === 0 ? (
						<div className="px-4 py-12 text-center text-[var(--color-text-muted)]">
							No categories found.
						</div>
					) : (
						filtered.map((cat: any) => (
							<div
								key={cat.id}
								className="flex items-center gap-4 px-4 py-3 hover:bg-[var(--color-bg)] transition-colors"
							>
								{/* Icon */}
								<div className="h-10 w-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center shrink-0">
									<FolderOpen className="h-5 w-5 text-[var(--color-primary)]" />
								</div>

								{/* Info */}
								<div className="flex-1 min-w-0">
									<h3 className="font-semibold text-sm">
										{cat.name}
									</h3>
									{cat.description && (
										<p className="text-xs text-[var(--color-text-muted)] truncate">
											{cat.description}
										</p>
									)}
								</div>

								{/* Slug & ID badges */}
								<span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-xs bg-[var(--color-border)] text-[var(--color-text-muted)] font-mono">
									{cat.slug}
								</span>
								<span className="hidden md:inline-block px-2 py-0.5 rounded-full text-xs bg-[var(--color-border)] text-[var(--color-text-muted)] font-mono">
									{cat.id}
								</span>
							</div>
						))
					)}
				</div>
			</div>
		</div>
	);
}
