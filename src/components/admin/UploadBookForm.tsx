"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Loader2, X, Plus } from "lucide-react";
import { localePath, t } from "@/lib/utils";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface UploadBookFormProps {
	dict: any;
	categories: any[];
	authors: any[];
}

export function UploadBookForm({
	dict,
	categories,
	authors,
}: UploadBookFormProps) {
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState("");
	const b = dict.book;
	const a = dict.admin;

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setIsSubmitting(true);
		setError("");

		const formData = new FormData(e.currentTarget);

		try {
			const res = await fetch("/api/admin/books", {
				method: "POST",
				body: formData,
			});

			if (!res.ok) {
				const data = await res.json();
				throw new Error(data.error || "Upload failed");
			}

			router.push(localePath("/admin/books"));
			router.refresh();
		} catch (err: any) {
			setError(err.message);
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
			{error && (
				<div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700 flex items-center gap-2">
					<X className="h-4 w-4" />
					{error}
				</div>
			)}

			{/* Title (multilingual) */}
			<fieldset className="space-y-3">
				<legend className="text-sm font-semibold">
					Book Title (Multilingual)
				</legend>
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					{(["en", "ar", "bn", "ur"] as const).map((lang) => (
						<div key={lang}>
							<label className="text-xs text-[var(--color-text-muted)] uppercase">
								{lang}
							</label>
							<input
								name={`title_${lang}`}
								type="text"
								dir={
									lang === "ar" || lang === "ur"
										? "rtl"
										: "ltr"
								}
								required={lang === "en"}
								className="w-full mt-1 rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
								placeholder={`Title in ${lang.toUpperCase()}`}
							/>
						</div>
					))}
				</div>
			</fieldset>

			{/* Author & Category */}
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div>
					<label className="text-sm font-semibold block mb-1">
						{b.author}
					</label>
					<select
						name="author_id"
						required
						className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
					>
						<option value="">Select author…</option>
						{authors.map((auth: any) => (
							<option key={auth.id} value={auth.id}>
								{t(auth.name)}
							</option>
						))}
					</select>
				</div>
				<div>
					<label className="text-sm font-semibold block mb-1">
						{b.category}
					</label>
					<select
						name="category_id"
						required
						className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
					>
						<option value="">Select category…</option>
						{categories.map((cat: any) => (
							<option key={cat.id} value={cat.id}>
								{t(cat.name)}
							</option>
						))}
					</select>
				</div>
			</div>

			{/* Language & Copyright */}
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div>
					<label className="text-sm font-semibold block mb-1">
						{b.language}
					</label>
					<select
						name="language_code"
						required
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
						required
						className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
					>
						<option value="public_domain">Public Domain</option>
						<option value="permission_granted">
							Permission Granted
						</option>
						<option value="restricted">Restricted</option>
					</select>
				</div>
			</div>

			{/* Description */}
			<div>
				<label className="text-sm font-semibold block mb-1">
					{b.description} (English)
				</label>
				<textarea
					name="description_en"
					rows={4}
					className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none resize-y"
					placeholder="Book description…"
				/>
			</div>

			{/* PDF Upload */}
			<div>
				<label className="text-sm font-semibold block mb-1">
					PDF File
				</label>
				<div className="rounded-xl border-2 border-dashed border-[var(--color-border)] p-8 text-center hover:border-[var(--color-primary)] transition-colors">
					<Upload className="mx-auto h-10 w-10 text-[var(--color-text-muted)] mb-3" />
					<input
						type="file"
						name="pdf"
						accept=".pdf"
						required
						className="w-full text-sm"
					/>
					<p className="text-xs text-[var(--color-text-muted)] mt-2">
						Max 50MB • PDF only
					</p>
				</div>
			</div>

			{/* Cover Image */}
			<div>
				<label className="text-sm font-semibold block mb-1">
					Cover Image (optional)
				</label>
				<input
					type="file"
					name="cover"
					accept="image/*"
					className="w-full text-sm"
				/>
			</div>

			{/* Options */}
			<div className="flex gap-6">
				<label className="flex items-center gap-2 text-sm">
					<input
						type="checkbox"
						name="is_downloadable"
						defaultChecked
						className="rounded border-[var(--color-border)]"
					/>
					Allow downloads
				</label>
				<label className="flex items-center gap-2 text-sm">
					<input
						type="checkbox"
						name="is_featured"
						className="rounded border-[var(--color-border)]"
					/>
					Featured
				</label>
			</div>

			{/* Submit */}
			<button
				type="submit"
				disabled={isSubmitting}
				className="flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50"
			>
				{isSubmitting ? (
					<Loader2 className="h-4 w-4 animate-spin" />
				) : (
					<Plus className="h-4 w-4" />
				)}
				{a.uploadBook}
			</button>
		</form>
	);
}
