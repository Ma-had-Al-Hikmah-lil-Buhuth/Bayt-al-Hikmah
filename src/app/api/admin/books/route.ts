import { type NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { slugify } from "@/lib/utils";

/* eslint-disable @typescript-eslint/no-explicit-any */

/** POST /api/admin/books — upload a new book (admin only) */
export const POST = async (request: NextRequest) => {
	try {
		const user = await getCurrentUser();
		if (!user || !user.isAdmin) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

		const supabase = await createAdminSupabaseClient();
		const formData = await request.formData();

		// Build title JSONB — single title stored under the selected language key
		const titleText = (formData.get("title") as string)?.trim();
		const languageCode = (formData.get("language_code") as string) || "en";

		if (!titleText) {
			return NextResponse.json(
				{ error: "Title is required" },
				{ status: 400 }
			);
		}

		const title: Record<string, string> = { [languageCode]: titleText };

		const authorId = formData.get("author_id") as string;
		const categoryId = formData.get("category_id") as string;
		const descriptionEn = formData.get("description_en") as string;
		const isDownloadable = formData.has("is_downloadable");
		const isFeatured = formData.has("is_featured");

		// Optional new fields
		const translatorId = formData.get("translator_id") as string | null;
		const translationOfId = formData.get("translation_of_id") as string | null;
		const tagsRaw = formData.get("tags") as string | null;

		// Upload PDF
		const pdfFile = formData.get("pdf") as File | null;
		if (!pdfFile) {
			return NextResponse.json(
				{ error: "PDF file is required" },
				{ status: 400 }
			);
		}

		const slug = slugify(titleText);
		const pdfPath = `books/${slug}/${pdfFile.name}`;
		const pdfBuffer = Buffer.from(await pdfFile.arrayBuffer());

		const { error: pdfError } = await supabase.storage
			.from("books")
			.upload(pdfPath, pdfBuffer, {
				contentType: "application/pdf",
				upsert: true,
			});

		if (pdfError) throw pdfError;

		const {
			data: { publicUrl: pdfUrl },
		} = supabase.storage.from("books").getPublicUrl(pdfPath);

		// Upload cover (optional)
		let coverUrl: string | null = null;
		const coverFile = formData.get("cover") as File | null;
		if (coverFile && coverFile.size > 0) {
			const coverPath = `covers/${slug}/${coverFile.name}`;
			const coverBuffer = Buffer.from(await coverFile.arrayBuffer());

			const { error: coverError } = await supabase.storage
				.from("covers")
				.upload(coverPath, coverBuffer, {
					contentType: coverFile.type,
					upsert: true,
				});

			if (!coverError) {
				const {
					data: { publicUrl },
				} = supabase.storage.from("covers").getPublicUrl(coverPath);
				coverUrl = publicUrl;
			}
		}

		// Build insert payload
		const insertPayload: Record<string, any> = {
			title,
			slug,
			category_id: categoryId,
			language_code: languageCode,
			description: descriptionEn ? { en: descriptionEn } : {},
			pdf_url: pdfUrl,
			cover_image_url: coverUrl,
			is_downloadable: isDownloadable,
			is_featured: isFeatured,
		};

		if (authorId) insertPayload.author_id = Number(authorId);

		if (translatorId) insertPayload.translator_id = Number(translatorId);
		if (translationOfId) insertPayload.translation_of_id = Number(translationOfId);

		// Insert book record
		const { data: book, error: insertError } = await supabase
			.from("books")
			.insert(insertPayload)
			.select()
			.single();

		if (insertError) throw insertError;

		// Resolve tags: create any that don't have IDs, then link all to book
		if (tagsRaw) {
			try {
				const tags: { id?: number; name: string }[] = JSON.parse(tagsRaw);
				const resolvedIds: number[] = [];

				for (const tag of tags) {
					if (tag.id) {
						resolvedIds.push(tag.id);
					} else if (tag.name?.trim()) {
						// Create the tag on the fly
						const tagSlug = slugify(tag.name.trim());
						const { data: existing } = await supabase
							.from("tags")
							.select("id")
							.eq("slug", tagSlug)
							.single();

						if (existing) {
							resolvedIds.push(existing.id);
						} else {
							const { data: created } = await supabase
								.from("tags")
								.insert({ name: { en: tag.name.trim() }, slug: tagSlug })
								.select("id")
								.single();
							if (created) resolvedIds.push(created.id);
						}
					}
				}

				if (resolvedIds.length > 0) {
					const bookTagRows = resolvedIds.map((tagId) => ({
						book_id: book.id,
						tag_id: tagId,
					}));
					await supabase.from("book_tags").insert(bookTagRows);
				}
			} catch {
				// tag insertion is non-critical
			}
		}

		return NextResponse.json({ data: book }, { status: 201 });
	} catch (err: any) {
		return NextResponse.json(
			{ error: err.message ?? "Upload failed" },
			{ status: 500 }
		);
	}
};
