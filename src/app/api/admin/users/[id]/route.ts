import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";

/* eslint-disable @typescript-eslint/no-explicit-any */

/** PATCH /api/admin/users/[id] — update user (e.g. toggle admin) */
export const PATCH = async (
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) => {
	try {
		const user = await getCurrentUser();
		if (!user?.isAdmin) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

		const { id } = await params;
		const body = await request.json();

		const update: Record<string, any> = {
			updated_at: new Date().toISOString(),
		};
		if (body.is_admin !== undefined) update.is_admin = body.is_admin;
		if (body.name !== undefined) update.name = body.name;

		if (Object.keys(update).length <= 1) {
			return NextResponse.json(
				{ error: "No valid fields to update" },
				{ status: 400 }
			);
		}

		const supabase = await createAdminSupabaseClient();
		const { data, error } = await supabase
			.from("users")
			.update(update)
			.eq("id", Number(id))
			.select("id, email, name, is_admin, created_at")
			.single();

		if (error) throw error;
		return NextResponse.json({ data });
	} catch (err: any) {
		return NextResponse.json(
			{ error: err.message ?? "Update failed" },
			{ status: 500 }
		);
	}
};
