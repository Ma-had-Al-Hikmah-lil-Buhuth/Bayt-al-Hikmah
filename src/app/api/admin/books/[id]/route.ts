import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";

/* eslint-disable @typescript-eslint/no-explicit-any */

/** PATCH /api/admin/books/[id] — update book */
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

		const supabase = await createAdminSupabaseClient();
		const { data, error } = await supabase
			.from("books")
			.update({
				...body,
				updated_at: new Date().toISOString(),
			})
			.eq("id", Number(id))
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
};

/** DELETE /api/admin/books/[id] — delete book */
export const DELETE = async (
	_request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) => {
	try {
		const user = await getCurrentUser();
		if (!user?.isAdmin) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

		const { id } = await params;
		const supabase = await createAdminSupabaseClient();
		const { error } = await supabase
			.from("books")
			.delete()
			.eq("id", Number(id));

		if (error) throw error;
		return NextResponse.json({ success: true });
	} catch (err: any) {
		return NextResponse.json(
			{ error: err.message ?? "Delete failed" },
			{ status: 500 }
		);
	}
};
