"use client";

import { useState } from "react";
import { Search, Plus, Edit2, Trash2, Users, Calendar } from "lucide-react";
import { t, cn } from "@/lib/utils";
import { AdminButton } from "./AdminButton";
import { ConfirmDialog } from "./ConfirmDialog";
import { Modal } from "./Modal";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface ManageAuthorsClientProps {
	dict: any;
	initialAuthors: any[];
}

export function ManageAuthorsClient({
	dict,
	initialAuthors,
}: ManageAuthorsClientProps) {
	const [authors, setAuthors] = useState(initialAuthors);
	const [search, setSearch] = useState("");
	const [showCreate, setShowCreate] = useState(false);
	const [editTarget, setEditTarget] = useState<any>(null);
	const [deleteTarget, setDeleteTarget] = useState<any>(null);
	const [saving, setSaving] = useState(false);
	const [deleting, setDeleting] = useState(false);
	const a = dict.admin;

	const filtered = authors.filter((author: any) => {
		const name = t(author.name).toLowerCase();
		return !search || name.includes(search.toLowerCase());
	});

	async function handleCreateOrEdit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setSaving(true);

		const form = new FormData(e.currentTarget);
		const nameEn = (form.get("name_en") as string)?.trim();
		const bioEn = (form.get("bio_en") as string)?.trim();

		const birthYear = form.get("birth_year") as string;
		const deathYear = form.get("death_year") as string;

		const payload = {
			name: nameEn ? { en: nameEn } : {},
			bio: bioEn ? { en: bioEn } : {},
			birth_year: birthYear ? parseInt(birthYear, 10) : null,
			death_year: deathYear ? parseInt(deathYear, 10) : null,
		};

		try {
			const isEdit = !!editTarget;
			const url = isEdit
				? `/api/admin/authors/${editTarget.id}`
				: "/api/admin/authors";
			const method = isEdit ? "PATCH" : "POST";

			const res = await fetch(url, {
				method,
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});

			if (res.ok) {
				const { data } = await res.json();
				if (isEdit) {
					setAuthors((prev: any[]) =>
						prev.map((a: any) =>
							a.id === editTarget.id ? data : a
						)
					);
					setEditTarget(null);
				} else {
					setAuthors((prev: any[]) => [data, ...prev]);
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
			const res = await fetch(`/api/admin/authors/${deleteTarget.id}`, {
				method: "DELETE",
			});
			if (res.ok) {
				setAuthors((prev: any[]) =>
					prev.filter((a: any) => a.id !== deleteTarget.id)
				);
			}
		} catch {
			// Error
		} finally {
			setDeleting(false);
			setDeleteTarget(null);
		}
	}

	function AuthorForm({ author }: { author?: any }) {
		return (
			<form onSubmit={handleCreateOrEdit} className="space-y-4">
				<div>
					<label className="text-sm font-semibold block mb-1">
						Name <span className="text-red-400">*</span>
					</label>
					<input
						name="name_en"
						defaultValue={author?.name?.en || ""}
						required
						className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
						placeholder="Author name"
					/>
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div>
						<label className="text-sm font-semibold block mb-1">
							Birth Year (Hijri)
						</label>
						<input
							name="birth_year"
							type="number"
							defaultValue={author?.birth_year || ""}
							className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
							placeholder="e.g. 661"
						/>
					</div>
					<div>
						<label className="text-sm font-semibold block mb-1">
							Death Year (Hijri)
						</label>
						<input
							name="death_year"
							type="number"
							defaultValue={author?.death_year || ""}
							className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
							placeholder="e.g. 728"
						/>
					</div>
				</div>

				<div>
					<label className="text-sm font-semibold block mb-1">
						Bio
					</label>
					<textarea
						name="bio_en"
						defaultValue={author?.bio?.en || ""}
						rows={3}
						className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none resize-y"
						placeholder="Short biography of the author…"
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
						{author ? "Save Changes" : "Create Author"}
					</AdminButton>
				</div>
			</form>
		);
	}

	return (
		<div className="px-4 py-8 sm:px-6 lg:px-8">
			{/* Header */}
			<div className="mb-6">
				<h1 className="text-2xl font-bold flex items-center gap-2">
					<Users className="h-6 w-6 text-[var(--color-primary)]" />
					{a.manageAuthors}
				</h1>
				<p className="text-sm text-[var(--color-text-muted)] mt-1">
					{filtered.length} of {authors.length} authors
				</p>
			</div>

			{/* Search + Add */}
			<div className="flex items-center gap-3 mb-6">
				<AdminButton
					icon={<Plus className="h-4 w-4" />}
					onClick={() => setShowCreate(true)}
				>
					Add Author
				</AdminButton>
				<div className="relative flex-1 max-w-md">
					<Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
					<input
						type="text"
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						placeholder="Search authors..."
						className="w-full ps-10 pe-4 py-2.5 rounded-xl border border-[var(--color-border)] text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none bg-[var(--color-surface)]"
					/>
				</div>
			</div>

			{/* Authors Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{filtered.length === 0 ? (
					<div className="col-span-full text-center py-12 text-[var(--color-text-muted)]">
						No authors found.
					</div>
				) : (
					filtered.map((author: any) => (
						<div
							key={author.id}
							className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 hover:shadow-md transition-shadow"
						>
							<div className="flex items-start gap-4">
								<div className="h-14 w-14 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center shrink-0">
									<Users className="h-6 w-6 text-[var(--color-primary)]" />
								</div>
								<div className="flex-1 min-w-0">
									<h3 className="font-semibold truncate">
										{t(author.name)}
									</h3>
									{(author.birth_year || author.death_year) && (
										<p className="text-xs text-[var(--color-text-muted)] mt-1 flex items-center gap-1">
											<Calendar className="h-3 w-3" />
											{author.birth_year || "?"} — {author.death_year || "?"} AH
										</p>
									)}
								</div>
							</div>
							<div className="flex justify-end gap-1 mt-4 pt-3 border-t border-[var(--color-border)]">
								<button
									onClick={() => setEditTarget(author)}
									className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:bg-blue-50 hover:text-blue-600 transition-colors"
									title="Edit"
								>
									<Edit2 className="h-4 w-4" />
								</button>
								<button
									onClick={() => setDeleteTarget(author)}
									className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:bg-red-50 hover:text-red-600 transition-colors"
									title="Delete"
								>
									<Trash2 className="h-4 w-4" />
								</button>
							</div>
						</div>
					))
				)}
			</div>

			{/* Create Modal */}
			<Modal
				open={showCreate}
				onClose={() => setShowCreate(false)}
				title="Add New Author"
				maxWidth="max-w-2xl"
			>
				<AuthorForm />
			</Modal>

			{/* Edit Modal */}
			<Modal
				open={!!editTarget}
				onClose={() => setEditTarget(null)}
				title="Edit Author"
				maxWidth="max-w-2xl"
			>
				{editTarget && <AuthorForm author={editTarget} />}
			</Modal>

			{/* Delete Confirm */}
			<ConfirmDialog
				open={!!deleteTarget}
				title="Delete Author"
				message={`Are you sure you want to delete "${deleteTarget ? t(deleteTarget.name) : ""}"? Books by this author must be reassigned first.`}
				confirmLabel="Delete"
				variant="danger"
				loading={deleting}
				onConfirm={handleDelete}
				onCancel={() => setDeleteTarget(null)}
			/>
		</div>
	);
}
