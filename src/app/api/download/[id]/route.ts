import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";

/* eslint-disable @typescript-eslint/no-explicit-any */

/** GET /api/download/[id] — secure download with tracking */
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	const { id } = await params;

	try {
		const supabase = await createServerSupabaseClient();

		// Fetch book
		const { data: book, error } = await supabase
			.from("books")
			.select("id, pdf_url, is_downloadable, title")
			.eq("id", Number(id))
			.single();

		if (error || !book) {
			return NextResponse.json(
				{ error: "Book not found" },
				{ status: 404 }
			);
		}

		if (!book.is_downloadable) {
			return NextResponse.json(
				{ error: "This book is not available for download" },
				{ status: 403 }
			);
		}

		// Get current user (may be null for anonymous downloads)
		const user = await getCurrentUser();

		// Record download
		const ip =
			request.headers.get("x-forwarded-for") ??
			request.headers.get("x-real-ip");
		const ua = request.headers.get("user-agent");

		await supabase.rpc("record_download", {
			p_book_id: book.id,
			p_user_id: user?.userId ? Number(user.userId) : null,
			p_ip: ip,
			p_ua: ua,
		});

		// Redirect to the PDF URL (served via CDN)
		return NextResponse.redirect(book.pdf_url);
	} catch (err: any) {
		return NextResponse.json(
			{ error: err.message ?? "Internal error" },
			{ status: 500 }
		);
	}
}
