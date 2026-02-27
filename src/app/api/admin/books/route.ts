import { type NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";

/** POST /api/admin/books — upload a new book (admin only) */
export async function POST(request: NextRequest) {
	try {
		const supabase = await createAdminSupabaseClient();

		// Verify admin
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		const { data: profile } = await supabase
			.from("profiles")
			.select("role")
			.eq("id", user.id)
			.single();

		if (profile?.role !== "admin") {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

		const formData = await request.formData();

		// Build title JSONB
		const title: Record<string, string> = {};
		for (const lang of ["en", "ar", "bn", "ur"]) {
			const val = formData.get(`title_${lang}`) as string | null;
			if (val?.trim()) title[lang] = val.trim();
		}

		if (!title.en) {
			return NextResponse.json(
				{ error: "English title is required" },
				{ status: 400 }
			);
		}

		const authorId = formData.get("author_id") as string;
		const categoryId = formData.get("category_id") as string;
		const languageCode = formData.get("language_code") as string;
		const copyright = formData.get("copyright") as string;
		const descriptionEn = formData.get("description_en") as string;
		const isDownloadable = formData.has("is_downloadable");
		const isFeatured = formData.has("is_featured");

		// Upload PDF
		const pdfFile = formData.get("pdf") as File | null;
		if (!pdfFile) {
			return NextResponse.json(
				{ error: "PDF file is required" },
				{ status: 400 }
			);
		}

		const slug = slugify(title.en);
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

		// Insert book record
		const { data: book, error: insertError } = await supabase
			.from("books")
			.insert({
				title,
				slug,
				author_id: authorId,
				category_id: categoryId,
				language_code: languageCode,
				description: descriptionEn ? { en: descriptionEn } : {},
				pdf_url: pdfUrl,
				cover_image_url: coverUrl,
				is_downloadable: isDownloadable,
				is_featured: isFeatured,
				copyright,
			})
			.select()
			.single();

		if (insertError) throw insertError;

		return NextResponse.json({ data: book }, { status: 201 });
	} catch (err: any) {
		return NextResponse.json(
			{ error: err.message ?? "Upload failed" },
			{ status: 500 }
		);
	}
}
