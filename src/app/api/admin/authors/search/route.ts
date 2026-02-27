import { type NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

/* eslint-disable @typescript-eslint/no-explicit-any */

/** GET /api/admin/authors/search?q=... — search authors by name */
export const GET = async (request: NextRequest) => {
	try {
		const q = request.nextUrl.searchParams.get("q")?.trim() || "";
		const limit = Math.min(30, Math.max(1, Number(request.nextUrl.searchParams.get("limit")) || 15));
		const supabase = await createAdminSupabaseClient();

		let query = supabase
			.from("authors")
			.select("id, name, bio, birth_year, death_year")
			.order("name->en")
			.limit(limit);

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
