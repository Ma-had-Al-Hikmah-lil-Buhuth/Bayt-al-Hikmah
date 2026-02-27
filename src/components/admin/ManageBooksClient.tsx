"use client";

import { useState } from "react";
import Link from "next/link";
import {
	Search,
	Plus,
	Edit2,
	Trash2,
	Star,
	StarOff,
	Eye,
	Download,
	BookOpen,
	Filter,
} from "lucide-react";
import { t, localePath, cn, formatCount, truncate } from "@/lib/utils";
import { AdminButton } from "./AdminButton";
import { ConfirmDialog } from "./ConfirmDialog";
import { Modal } from "./Modal";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface ManageBooksClientProps {
	dict: any;
	initialBooks: any[];
	authors: any[];
	categories: any[];
}

export function ManageBooksClient({
	dict,
	initialBooks,
	authors,
	categories,
}: ManageBooksClientProps) {
	const [books, setBooks] = useState(initialBooks);
	const [search, setSearch] = useState("");
	const [filterCategory, setFilterCategory] = useState("");
	const [deleteTarget, setDeleteTarget] = useState<any>(null);
	const [deleting, setDeleting] = useState(false);
	const [editTarget, setEditTarget] = useState<any>(null);
	const [saving, setSaving] = useState(false);
	const a = dict.admin;

	// Filter books
	const filtered = books.filter((book: any) => {
		const title = t(book.title).toLowerCase();
		const authorName = book.author
			? t(book.author.name).toLowerCase()
			: "";
		const matchesSearch =
			!search ||
			title.includes(search.toLowerCase()) ||
			authorName.includes(search.toLowerCase());
		const matchesCategory =
			!filterCategory || book.category_id === filterCategory;
		return matchesSearch && matchesCategory;
	});

	async function handleDelete() {
		if (!deleteTarget) return;
		setDeleting(true);
		try {
			const res = await fetch(`/api/admin/books/${deleteTarget.id}`, {
				method: "DELETE",
			});
			if (res.ok) {
				setBooks((prev: any[]) =>
					prev.filter((b: any) => b.id !== deleteTarget.id)
				);
			}
		} catch {
			// Error handling
		} finally {
			setDeleting(false);
			setDeleteTarget(null);
		}
	}

	async function handleToggleFeatured(book: any) {
		try {
			const res = await fetch(`/api/admin/books/${book.id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ is_featured: !book.is_featured }),
			});
			if (res.ok) {
				setBooks((prev: any[]) =>
					prev.map((b: any) =>
						b.id === book.id
							? { ...b, is_featured: !b.is_featured }
							: b
					)
				);
			}
		} catch {
			// Error
		}
	}

	async function handleEditSave(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		if (!editTarget) return;
		setSaving(true);

		const form = new FormData(e.currentTarget);
		const title: Record<string, string> = {};
		for (const lang of ["en", "ar", "bn", "ur"]) {
			const val = form.get(`title_${lang}`) as string;
			if (val?.trim()) title[lang] = val.trim();
		}

		const payload = {
			title,
			author_id: form.get("author_id"),
			category_id: form.get("category_id"),
			language_code: form.get("language_code"),
			is_downloadable: form.get("is_downloadable") === "on",
			is_featured: form.get("is_featured") === "on",
			copyright: form.get("copyright"),
			description: { en: form.get("description_en") as string },
		};

		try {
			const res = await fetch(`/api/admin/books/${editTarget.id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});
			if (res.ok) {
				const { data } = await res.json();
				// Refresh with updated author/category references
				const updatedAuthor = authors.find(
					(a: any) => a.id === payload.author_id
				);
				const updatedCategory = categories.find(
					(c: any) => c.id === payload.category_id
				);
				setBooks((prev: any[]) =>
					prev.map((b: any) =>
						b.id === editTarget.id
							? {
									...b,
									...data,
									author: updatedAuthor || b.author,
									category: updatedCategory || b.category,
								}
							: b
					)
				);
				setEditTarget(null);
			}
		} catch {
			// Error
		} finally {
			setSaving(false);
		}
	}

	return (
		<div className="px-4 py-8 sm:px-6 lg:px-8">
			{/* Header */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
				<div>
					<h1 className="text-2xl font-bold flex items-center gap-2">
						<BookOpen className="h-6 w-6 text-[var(--color-primary)]" />
						{a.manageBooks}
					</h1>
					<p className="text-sm text-[var(--color-text-muted)] mt-1">
						{filtered.length} of {books.length} books
					</p>
				</div>
				<Link href={localePath("/admin/books/new")}>
					<AdminButton icon={<Plus className="h-4 w-4" />}>
						{a.uploadBook}
					</AdminButton>
				</Link>
			</div>

			{/* Filters */}
			<div className="flex flex-col sm:flex-row gap-3 mb-6">
				<div className="relative flex-1">
					<Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
					<input
						type="text"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Search books by title or author..."
						className="w-full ps-10 pe-4 py-2.5 rounded-xl border border-[var(--color-border)] text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none bg-[var(--color-surface)]"
					/>
				</div>
				<select
					value={filterCategory}
					onChange={(e) => setFilterCategory(e.target.value)}
					className="rounded-xl border border-[var(--color-border)] px-3 py-2.5 text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none bg-[var(--color-surface)]"
				>
					<option value="">All Categories</option>
					{categories.map((cat: any) => (
						<option key={cat.id} value={cat.id}>
							{typeof cat.name === "string" ? cat.name : t(cat.name)}
						</option>
					))}
				</select>
			</div>

			{/* Table */}
			<div className="rounded-2xl border border-[var(--color-border)] overflow-hidden bg-[var(--color-surface)]">
				<div className="overflow-x-auto">
					<table className="w-full text-sm">
						<thead>
							<tr className="border-b border-[var(--color-border)] bg-[var(--color-bg)]">
								<th className="text-start px-4 py-3 font-semibold">
									Book
								</th>
								<th className="text-start px-4 py-3 font-semibold hidden md:table-cell">
									Author
								</th>
								<th className="text-start px-4 py-3 font-semibold hidden lg:table-cell">
									Category
								</th>
								<th className="text-center px-4 py-3 font-semibold hidden sm:table-cell">
									Views
								</th>
								<th className="text-center px-4 py-3 font-semibold hidden sm:table-cell">
									Downloads
								</th>
								<th className="text-center px-4 py-3 font-semibold">
									Featured
								</th>
								<th className="text-end px-4 py-3 font-semibold">
									Actions
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-[var(--color-border)]">
							{filtered.length === 0 ? (
								<tr>
									<td
										colSpan={7}
										className="px-4 py-12 text-center text-[var(--color-text-muted)]"
									>
										No books found.
									</td>
								</tr>
							) : (
								filtered.map((book: any) => (
									<tr
										key={book.id}
										className="hover:bg-[var(--color-bg)] transition-colors"
									>
										<td className="px-4 py-3">
											<div className="flex items-center gap-3">
												{book.cover_image_url ? (
													<img
														src={
															book.cover_image_url
														}
														alt=""
														className="h-12 w-9 rounded-lg object-cover border border-[var(--color-border)]"
													/>
												) : (
													<div className="h-12 w-9 rounded-lg bg-[var(--color-border)] flex items-center justify-center">
														<BookOpen className="h-4 w-4 text-[var(--color-text-muted)]" />
													</div>
												)}
												<div className="min-w-0">
													<p className="font-medium truncate max-w-[200px]">
														{t(book.title)}
													</p>
													<p className="text-xs text-[var(--color-text-muted)] uppercase">
														{book.language_code} •{" "}
														{book.copyright?.replace(
															"_",
															" "
														)}
													</p>
												</div>
											</div>
										</td>
										<td className="px-4 py-3 hidden md:table-cell text-[var(--color-text-muted)]">
											{book.author
												? t(book.author.name)
												: "—"}
										</td>
										<td className="px-4 py-3 hidden lg:table-cell">
											<span className="inline-block px-2 py-0.5 rounded-full text-xs bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-medium">
												{categories.find((c: any) => c.id === book.category_id)?.name ?? book.category_id ?? "—"}
											</span>
										</td>
										<td className="px-4 py-3 text-center hidden sm:table-cell text-[var(--color-text-muted)]">
											<span className="flex items-center justify-center gap-1">
												<Eye className="h-3.5 w-3.5" />
												{formatCount(
													book.view_count ?? 0
												)}
											</span>
										</td>
										<td className="px-4 py-3 text-center hidden sm:table-cell text-[var(--color-text-muted)]">
											<span className="flex items-center justify-center gap-1">
												<Download className="h-3.5 w-3.5" />
												{formatCount(
													book.download_count ?? 0
												)}
											</span>
										</td>
										<td className="px-4 py-3 text-center">
											<button
												onClick={() =>
													handleToggleFeatured(book)
												}
												className={cn(
													"p-1.5 rounded-lg transition-colors",
													book.is_featured
														? "text-amber-500 hover:bg-amber-50"
														: "text-[var(--color-text-muted)] hover:bg-[var(--color-border)]"
												)}
												title={
													book.is_featured
														? "Remove from featured"
														: "Add to featured"
												}
											>
												{book.is_featured ? (
													<Star className="h-4 w-4 fill-current" />
												) : (
													<StarOff className="h-4 w-4" />
												)}
											</button>
										</td>
										<td className="px-4 py-3">
											<div className="flex items-center justify-end gap-1">
												<button
													onClick={() =>
														setEditTarget(book)
													}
													className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:bg-blue-50 hover:text-blue-600 transition-colors"
													title="Edit"
												>
													<Edit2 className="h-4 w-4" />
												</button>
												<button
													onClick={() =>
														setDeleteTarget(book)
													}
													className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:bg-red-50 hover:text-red-600 transition-colors"
													title="Delete"
												>
													<Trash2 className="h-4 w-4" />
												</button>
											</div>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</div>

			{/* Delete Confirm */}
			<ConfirmDialog
				open={!!deleteTarget}
				title="Delete Book"
				message={`Are you sure you want to delete "${deleteTarget ? t(deleteTarget.title) : ""}"? This cannot be undone.`}
				confirmLabel="Delete"
				variant="danger"
				loading={deleting}
				onConfirm={handleDelete}
				onCancel={() => setDeleteTarget(null)}
			/>

			{/* Edit Modal */}
			<Modal
				open={!!editTarget}
				onClose={() => setEditTarget(null)}
				title="Edit Book"
				maxWidth="max-w-2xl"
			>
				{editTarget && (
					<form onSubmit={handleEditSave} className="space-y-4">
						{/* Multilingual Titles */}
						<fieldset className="space-y-3">
							<legend className="text-sm font-semibold">
								Title
							</legend>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
								{(["en", "ar", "bn", "ur"] as const).map(
									(lang) => (
										<div key={lang}>
											<label className="text-xs text-[var(--color-text-muted)] uppercase">
												{lang}
											</label>
											<input
												name={`title_${lang}`}
												defaultValue={
													editTarget.title?.[lang] ||
													""
												}
												dir={
													lang === "ar" ||
													lang === "ur"
														? "rtl"
														: "ltr"
												}
												required={lang === "en"}
												className="w-full mt-1 rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
											/>
										</div>
									)
								)}
							</div>
						</fieldset>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div>
								<label className="text-sm font-semibold block mb-1">
									Author
								</label>
								<select
									name="author_id"
									defaultValue={editTarget.author_id}
									required
									className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
								>
									{authors.map((auth: any) => (
										<option key={auth.id} value={auth.id}>
											{t(auth.name)}
										</option>
									))}
								</select>
							</div>
							<div>
								<label className="text-sm font-semibold block mb-1">
									Category
								</label>
								<select
									name="category_id"
									defaultValue={editTarget.category_id}
									required
									className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
								>
									{categories.map((cat: any) => (
										<option key={cat.id} value={cat.id}>
											{typeof cat.name === "string" ? cat.name : t(cat.name)}
										</option>
									))}
								</select>
							</div>
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div>
								<label className="text-sm font-semibold block mb-1">
									Language
								</label>
								<select
									name="language_code"
									defaultValue={editTarget.language_code}
									className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
								>
									<option value="ar">العربية</option>
									<option value="en">English</option>
									<option value="bn">বাংলা</option>
									<option value="ur">اردو</option>
								</select>
							</div>
							<div>
								<label className="text-sm font-semibold block mb-1">
									Copyright
								</label>
								<select
									name="copyright"
									defaultValue={editTarget.copyright}
									className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
								>
									<option value="public_domain">
										Public Domain
									</option>
									<option value="permission_granted">
										Permission Granted
									</option>
									<option value="restricted">
										Restricted
									</option>
								</select>
							</div>
						</div>

						<div>
							<label className="text-sm font-semibold block mb-1">
								Description (English)
							</label>
							<textarea
								name="description_en"
								rows={3}
								defaultValue={editTarget.description?.en || ""}
								className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none resize-y"
							/>
						</div>

						<div className="flex gap-6">
							<label className="flex items-center gap-2 text-sm">
								<input
									type="checkbox"
									name="is_downloadable"
									defaultChecked={editTarget.is_downloadable}
									className="rounded"
								/>
								Downloadable
							</label>
							<label className="flex items-center gap-2 text-sm">
								<input
									type="checkbox"
									name="is_featured"
									defaultChecked={editTarget.is_featured}
									className="rounded"
								/>
								Featured
							</label>
						</div>

						<div className="flex justify-end gap-3 pt-2">
							<AdminButton
								type="button"
								variant="ghost"
								onClick={() => setEditTarget(null)}
							>
								Cancel
							</AdminButton>
							<AdminButton type="submit" loading={saving}>
								Save Changes
							</AdminButton>
						</div>
					</form>
				)}
			</Modal>
		</div>
	);
}
