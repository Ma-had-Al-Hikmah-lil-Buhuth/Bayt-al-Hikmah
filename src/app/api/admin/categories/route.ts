import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

async function verifyAdmin(supabase: any) {
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!user) return { error: "Unauthorized", status: 401 };

	const { data: profile } = await supabase
		.from("profiles")
		.select("role")
		.eq("id", user.id)
		.single();

	if (profile?.role !== "admin") return { error: "Forbidden", status: 403 };
	return { user, profile };
}

/** GET /api/admin/categories */
export async function GET() {
	try {
		const supabase = await createServerSupabaseClient();
		const { data, error } = await supabase
			.from("categories")
			.select("*")
			.order("sort_order");

		if (error) throw error;
		return NextResponse.json({ data });
	} catch (err: any) {
		return NextResponse.json(
			{ error: err.message ?? "Failed to fetch categories" },
			{ status: 500 }
		);
	}
}

/** POST /api/admin/categories — create category */
export async function POST(request: NextRequest) {
	try {
		const supabase = await createServerSupabaseClient();
		const auth = await verifyAdmin(supabase);
		if ("error" in auth) {
			return NextResponse.json(
				{ error: auth.error },
				{ status: auth.status }
			);
		}

		const body = await request.json();

		if (!body.name?.en) {
			return NextResponse.json(
				{ error: "English name is required" },
				{ status: 400 }
			);
		}

		const { data, error } = await supabase
			.from("categories")
			.insert(body)
			.select()
			.single();

		if (error) throw error;
		return NextResponse.json({ data }, { status: 201 });
	} catch (err: any) {
		return NextResponse.json(
			{ error: err.message ?? "Create failed" },
			{ status: 500 }
		);
	}
}
