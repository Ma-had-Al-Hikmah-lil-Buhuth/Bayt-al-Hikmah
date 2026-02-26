"use client";

import { useState } from "react";
import {
	Search,
	Plus,
	Edit2,
	Trash2,
	FolderOpen,
	GripVertical,
	ArrowUp,
	ArrowDown,
} from "lucide-react";
import { t, cn, slugify } from "@/lib/utils";
import { AdminButton } from "./AdminButton";
import { ConfirmDialog } from "./ConfirmDialog";
import { Modal } from "./Modal";
import type { Locale } from "@/types/database";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface ManageCategoriesClientProps {
	locale: Locale;
	dict: any;
	initialCategories: any[];
}

export function ManageCategoriesClient({
	locale,
	dict,
	initialCategories,
}: ManageCategoriesClientProps) {
	const [categories, setCategories] = useState(initialCategories);
	const [search, setSearch] = useState("");
	const [showCreate, setShowCreate] = useState(false);
	const [editTarget, setEditTarget] = useState<any>(null);
	const [deleteTarget, setDeleteTarget] = useState<any>(null);
	const [saving, setSaving] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const a = dict.admin;

	const filtered = categories.filter((cat: any) => {
		const name = t(cat.name, locale).toLowerCase();
		return !search || name.includes(search.toLowerCase());
	});

	async function handleCreateOrEdit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setSaving(true);

		const form = new FormData(e.currentTarget);
		const name: Record<string, string> = {};
		const description: Record<string, string> = {};
		for (const lang of ["en", "ar", "bn", "ur"]) {
			const nVal = form.get(`name_${lang}`) as string;
			const dVal = form.get(`description_${lang}`) as string;
			if (nVal?.trim()) name[lang] = nVal.trim();
			if (dVal?.trim()) description[lang] = dVal.trim();
		}

		const payload = {
			name,
			description,
			slug: slugify(name.en || ""),
			icon_url: (form.get("icon_url") as string) || null,
			sort_order: parseInt((form.get("sort_order") as string) || "0", 10),
			parent_id: (form.get("parent_id") as string) || null,
		};

		try {
			const isEdit = !!editTarget;
			const url = isEdit
				? `/api/admin/categories/${editTarget.id}`
				: "/api/admin/categories";
			const method = isEdit ? "PATCH" : "POST";

			const res = await fetch(url, {
				method,
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});

			if (res.ok) {
				const { data } = await res.json();
				if (isEdit) {
					setCategories((prev: any[]) =>
						prev.map((c: any) =>
							c.id === editTarget.id ? data : c
						)
					);
					setEditTarget(null);
				} else {
					setCategories((prev: any[]) => [...prev, data]);
					setShowCreate(false);
				}
			}
		} catch {
			// Error
		} finally {
			setSaving(false);
		}
	}

	async function handleDelete() {
		if (!deleteTarget) return;
		setDeleting(true);
		try {
			const res = await fetch(
				`/api/admin/categories/${deleteTarget.id}`,
				{
					method: "DELETE",
				}
			);
			if (res.ok) {
				setCategories((prev: any[]) =>
					prev.filter((c: any) => c.id !== deleteTarget.id)
				);
			}
		} catch {
			// Error
		} finally {
			setDeleting(false);
			setDeleteTarget(null);
		}
	}

	async function handleReorder(catId: string, direction: "up" | "down") {
		const idx = categories.findIndex((c: any) => c.id === catId);
		if (
			(direction === "up" && idx <= 0) ||
			(direction === "down" && idx >= categories.length - 1)
		)
			return;

		const newCats = [...categories];
		const swapIdx = direction === "up" ? idx - 1 : idx + 1;
		[newCats[idx], newCats[swapIdx]] = [newCats[swapIdx], newCats[idx]];

		// Update sort_order
		const updated = newCats.map((c, i) => ({ ...c, sort_order: i }));
		setCategories(updated);

		// Persist
		try {
			await fetch("/api/admin/categories/reorder", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					items: updated.map((c) => ({
						id: c.id,
						sort_order: c.sort_order,
					})),
				}),
			});
		} catch {
			// Revert on error
			setCategories(categories);
		}
	}

	function CategoryForm({ category }: { category?: any }) {
		return (
			<form onSubmit={handleCreateOrEdit} className="space-y-4">
				<fieldset className="space-y-3">
					<legend className="text-sm font-semibold">
						Name (Multilingual)
					</legend>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
						{(["en", "ar", "bn", "ur"] as const).map((lang) => (
							<div key={lang}>
								<label className="text-xs text-[var(--color-text-muted)] uppercase">
									{lang}
								</label>
								<input
									name={`name_${lang}`}
									defaultValue={category?.name?.[lang] || ""}
									dir={
										lang === "ar" || lang === "ur"
											? "rtl"
											: "ltr"
									}
									required={lang === "en"}
									className="w-full mt-1 rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
									placeholder={`Name in ${lang.toUpperCase()}`}
								/>
							</div>
						))}
					</div>
				</fieldset>

				<fieldset className="space-y-3">
					<legend className="text-sm font-semibold">
						Description (Multilingual)
					</legend>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
						{(["en", "ar", "bn", "ur"] as const).map((lang) => (
							<div key={lang}>
								<label className="text-xs text-[var(--color-text-muted)] uppercase">
									{lang}
								</label>
								<input
									name={`description_${lang}`}
									defaultValue={
										category?.description?.[lang] || ""
									}
									dir={
										lang === "ar" || lang === "ur"
											? "rtl"
											: "ltr"
									}
									className="w-full mt-1 rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
									placeholder={`Description in ${lang.toUpperCase()}`}
								/>
							</div>
						))}
					</div>
				</fieldset>

				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div>
						<label className="text-sm font-semibold block mb-1">
							Parent Category
						</label>
						<select
							name="parent_id"
							defaultValue={category?.parent_id || ""}
							className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
						>
							<option value="">None (Top-level)</option>
							{categories
								.filter((c: any) => c.id !== category?.id)
								.map((c: any) => (
									<option key={c.id} value={c.id}>
										{t(c.name, locale)}
									</option>
								))}
						</select>
					</div>
					<div>
						<label className="text-sm font-semibold block mb-1">
							Sort Order
						</label>
						<input
							name="sort_order"
							type="number"
							defaultValue={
								category?.sort_order ?? categories.length
							}
							className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
						/>
					</div>
				</div>

				<div>
					<label className="text-sm font-semibold block mb-1">
						Icon URL
					</label>
					<input
						name="icon_url"
						defaultValue={category?.icon_url || ""}
						type="url"
						className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
						placeholder="https://..."
					/>
				</div>

				<div className="flex justify-end gap-3 pt-2">
					<AdminButton
						type="button"
						variant="ghost"
						onClick={() => {
							setShowCreate(false);
							setEditTarget(null);
						}}
					>
						Cancel
					</AdminButton>
					<AdminButton type="submit" loading={saving}>
						{category ? "Save Changes" : "Create Category"}
					</AdminButton>
				</div>
			</form>
		);
	}

	return (
		<div className="px-4 py-8 sm:px-6 lg:px-8">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
				<div>
					<h1 className="text-2xl font-bold flex items-center gap-2">
						<FolderOpen className="h-6 w-6 text-[var(--color-primary)]" />
						{a.manageCategories}
					</h1>
					<p className="text-sm text-[var(--color-text-muted)] mt-1">
						{categories.length} categories
					</p>
				</div>
				<AdminButton
					icon={<Plus className="h-4 w-4" />}
					onClick={() => setShowCreate(true)}
				>
					Add Category
				</AdminButton>
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
						filtered.map((cat: any, idx: number) => (
							<div
								key={cat.id}
								className="flex items-center gap-4 px-4 py-3 hover:bg-[var(--color-bg)] transition-colors"
							>
								{/* Reorder */}
								<div className="flex flex-col gap-0.5">
									<button
										onClick={() =>
											handleReorder(cat.id, "up")
										}
										disabled={idx === 0}
										className="p-0.5 rounded text-[var(--color-text-muted)] hover:text-[var(--color-text)] disabled:opacity-30"
									>
										<ArrowUp className="h-3.5 w-3.5" />
									</button>
									<button
										onClick={() =>
											handleReorder(cat.id, "down")
										}
										disabled={idx === filtered.length - 1}
										className="p-0.5 rounded text-[var(--color-text-muted)] hover:text-[var(--color-text)] disabled:opacity-30"
									>
										<ArrowDown className="h-3.5 w-3.5" />
									</button>
								</div>

								{/* Icon */}
								<div className="h-10 w-10 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center shrink-0">
									{cat.icon_url ? (
										<img
											src={cat.icon_url}
											alt=""
											className="h-5 w-5"
										/>
									) : (
										<FolderOpen className="h-5 w-5 text-[var(--color-primary)]" />
									)}
								</div>

								{/* Info */}
								<div className="flex-1 min-w-0">
									<h3 className="font-semibold text-sm">
										{t(cat.name, locale)}
									</h3>
									{cat.description?.en && (
										<p className="text-xs text-[var(--color-text-muted)] truncate">
											{cat.description.en}
										</p>
									)}
								</div>

								{/* Slug badge */}
								<span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-xs bg-[var(--color-border)] text-[var(--color-text-muted)] font-mono">
									{cat.slug}
								</span>

								{/* Actions */}
								<div className="flex items-center gap-1">
									<button
										onClick={() => setEditTarget(cat)}
										className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:bg-blue-50 hover:text-blue-600 transition-colors"
									>
										<Edit2 className="h-4 w-4" />
									</button>
									<button
										onClick={() => setDeleteTarget(cat)}
										className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:bg-red-50 hover:text-red-600 transition-colors"
									>
										<Trash2 className="h-4 w-4" />
									</button>
								</div>
							</div>
						))
					)}
				</div>
			</div>

			{/* Create Modal */}
			<Modal
				open={showCreate}
				onClose={() => setShowCreate(false)}
				title="Add New Category"
				maxWidth="max-w-2xl"
			>
				<CategoryForm />
			</Modal>

			{/* Edit Modal */}
			<Modal
				open={!!editTarget}
				onClose={() => setEditTarget(null)}
				title="Edit Category"
				maxWidth="max-w-2xl"
			>
				{editTarget && <CategoryForm category={editTarget} />}
			</Modal>

			{/* Delete Confirm */}
			<ConfirmDialog
				open={!!deleteTarget}
				title="Delete Category"
				message={`Are you sure you want to delete "${deleteTarget ? t(deleteTarget.name, locale) : ""}"? Books in this category must be reassigned first.`}
				confirmLabel="Delete"
				variant="danger"
				loading={deleting}
				onConfirm={handleDelete}
				onCancel={() => setDeleteTarget(null)}
			/>
		</div>
	);
}
