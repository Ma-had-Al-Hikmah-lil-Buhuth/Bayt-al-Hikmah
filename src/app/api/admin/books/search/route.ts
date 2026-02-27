import { type NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/** GET /api/admin/books/search?q=... — search books for translation linking */
export const GET = async (request: NextRequest) => {
	try {
		const q = request.nextUrl.searchParams.get("q")?.trim() || "";
		const supabase = await createServerSupabaseClient();

		let query = supabase
			.from("books")
			.select("id, title, slug, language_code, author:authors(name)")
			.order("created_at", { ascending: false })
			.limit(10);

		if (q) {
			query = query.or(
				`title->>en.ilike.%${q}%,title->>ar.ilike.%${q}%,title->>bn.ilike.%${q}%,title->>ur.ilike.%${q}%,slug.ilike.%${q}%`
			);
		}

		const { data, error } = await query;
		if (error) throw error;

		return NextResponse.json({ data: data ?? [] });
	} catch (err: any) {
		return NextResponse.json(
			{ error: err.message ?? "Search failed" },
			{ status: 500 }
		);
	}
};
