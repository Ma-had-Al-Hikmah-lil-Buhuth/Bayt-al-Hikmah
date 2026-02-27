import { type NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient, createAdminSupabaseClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils";

/** GET /api/admin/tags?q=... — search/list tags */
export const GET = async (request: NextRequest) => {
	try {
		const q = request.nextUrl.searchParams.get("q")?.trim() || "";
		const supabase = await createServerSupabaseClient();

		let query = supabase
			.from("tags")
			.select("id, name, slug")
			.order("name")
			.limit(20);

		if (q) {
			query = query.or(
				`name->>en.ilike.%${q}%,name->>ar.ilike.%${q}%,slug.ilike.%${q}%`
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

/** POST /api/admin/tags — create a new tag */
export const POST = async (request: NextRequest) => {
	try {
		const body = await request.json();
		const name = body.name?.trim();

		if (!name) {
			return NextResponse.json(
				{ error: "Tag name is required" },
				{ status: 400 }
			);
		}

		const supabase = await createAdminSupabaseClient();
		const slug = slugify(name);

		// Check if tag already exists
		const { data: existing } = await supabase
			.from("tags")
			.select("id, name, slug")
			.eq("slug", slug)
			.single();

		if (existing) {
			return NextResponse.json({ data: existing });
		}

		const { data, error } = await supabase
			.from("tags")
			.insert({ name: { en: name }, slug })
			.select("id, name, slug")
			.single();

		if (error) throw error;

		return NextResponse.json({ data }, { status: 201 });
	} catch (err: any) {
		return NextResponse.json(
			{ error: err.message ?? "Create failed" },
			{ status: 500 }
		);
	}
};
