import { type NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/** GET /api/admin/authors/search?q=... — search authors by name */
export const GET = async (request: NextRequest) => {
	try {
		const q = request.nextUrl.searchParams.get("q")?.trim() || "";
		const supabase = await createServerSupabaseClient();

		let query = supabase
			.from("authors")
			.select("id, name, bio, death_date_hijri")
			.order("name")
			.limit(15);

		if (q) {
			// Search across all language keys in the JSONB name field
			query = query.or(
				`name->>en.ilike.%${q}%,name->>ar.ilike.%${q}%,name->>bn.ilike.%${q}%,name->>ur.ilike.%${q}%`
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
