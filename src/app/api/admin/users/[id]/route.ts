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

/** PATCH /api/admin/users/[id] — update user role */
export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id } = await params;
		const supabase = await createServerSupabaseClient();
		const auth = await verifyAdmin(supabase);
		if ("error" in auth) {
			return NextResponse.json(
				{ error: auth.error },
				{ status: auth.status }
			);
		}

		const body = await request.json();

		// Only allow updating certain fields
		const allowedFields: Record<string, any> = {};
		if (body.role && ["reader", "editor", "admin"].includes(body.role)) {
			allowedFields.role = body.role;
		}
		if (body.display_name !== undefined) {
			allowedFields.display_name = body.display_name;
		}

		if (Object.keys(allowedFields).length === 0) {
			return NextResponse.json(
				{ error: "No valid fields to update" },
				{ status: 400 }
			);
		}

		const { data, error } = await supabase
			.from("profiles")
			.update({ ...allowedFields, updated_at: new Date().toISOString() })
			.eq("id", id)
			.select()
			.single();

		if (error) throw error;
		return NextResponse.json({ data });
	} catch (err: any) {
		return NextResponse.json(
			{ error: err.message ?? "Update failed" },
			{ status: 500 }
		);
	}
}
