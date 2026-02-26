import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/** POST /api/bookmarks — save a bookmark */
export async function POST(request: NextRequest) {
	try {
		const supabase = await createServerSupabaseClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		const body = await request.json();
		const { book_id, page_number, label } = body;

		if (!book_id || !page_number) {
			return NextResponse.json(
				{ error: "book_id and page_number are required" },
				{ status: 400 }
			);
		}

		const { data, error } = await supabase
			.from("bookmarks")
			.upsert(
				{
					user_id: user.id,
					book_id,
					page_number,
					label: label ?? null,
				},
				{ onConflict: "user_id,book_id,page_number" }
			)
			.select()
			.single();

		if (error) throw error;

		return NextResponse.json({ data });
	} catch (err: any) {
		return NextResponse.json(
			{ error: err.message ?? "Internal error" },
			{ status: 500 }
		);
	}
}

/** GET /api/bookmarks?book_id=xxx — get user bookmarks for a book */
export async function GET(request: NextRequest) {
	try {
		const supabase = await createServerSupabaseClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		const bookId = new URL(request.url).searchParams.get("book_id");

		let qb = supabase
			.from("bookmarks")
			.select("*")
			.eq("user_id", user.id)
			.order("page_number", { ascending: true });

		if (bookId) {
			qb = qb.eq("book_id", bookId);
		}

		const { data, error } = await qb;
		if (error) throw error;

		return NextResponse.json({ data });
	} catch (err: any) {
		return NextResponse.json(
			{ error: err.message ?? "Internal error" },
			{ status: 500 }
		);
	}
}

/** DELETE /api/bookmarks — delete a bookmark */
export async function DELETE(request: NextRequest) {
	try {
		const supabase = await createServerSupabaseClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return NextResponse.json(
				{ error: "Unauthorized" },
				{ status: 401 }
			);
		}

		const body = await request.json();
		const { bookmark_id } = body;

		const { error } = await supabase
			.from("bookmarks")
			.delete()
			.eq("id", bookmark_id)
			.eq("user_id", user.id);

		if (error) throw error;

		return NextResponse.json({ success: true });
	} catch (err: any) {
		return NextResponse.json(
			{ error: err.message ?? "Internal error" },
			{ status: 500 }
		);
	}
}
