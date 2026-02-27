import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";

/* eslint-disable @typescript-eslint/no-explicit-any */

const AUTHOR_SELECT = "id, name, bio, birth_year, death_year, created_at";

/** GET /api/admin/authors/[id] — single author */
export const GET = async (
	_request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) => {
	try {
		const { id } = await params;
		const supabase = await createAdminSupabaseClient();
		const { data, error } = await supabase
			.from("authors")
			.select(AUTHOR_SELECT)
			.eq("id", Number(id))
			.single();

		if (error) throw error;
		if (!data) {
			return NextResponse.json(
				{ error: "Author not found" },
				{ status: 404 }
			);
		}
		return NextResponse.json({ data });
	} catch (err: any) {
		return NextResponse.json(
			{ error: err.message ?? "Not found" },
			{ status: 404 }
		);
	}
};

/** PATCH /api/admin/authors/[id] — update author */
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

		// ── Validation ──────────────────────────────────────────
		if (body.name !== undefined) {
			if (typeof body.name !== "object") {
				return NextResponse.json(
					{ error: "Name must be a JSONB object" },
					{ status: 400 }
				);
			}
			const hasName = Object.values(body.name).some(
				(v) => typeof v === "string" && (v as string).trim().length > 0
			);
			if (!hasName) {
				return NextResponse.json(
					{ error: "At least one language name is required" },
					{ status: 400 }
				);
			}
		}

		const birthYear = body.birth_year ?? undefined;
		const deathYear = body.death_year ?? undefined;

		if (birthYear !== undefined && birthYear !== null && (birthYear < 1 || birthYear > 2000)) {
			return NextResponse.json(
				{ error: "Birth year must be between 1 and 2000" },
				{ status: 400 }
			);
		}
		if (deathYear !== undefined && deathYear !== null && (deathYear < 1 || deathYear > 2000)) {
			return NextResponse.json(
				{ error: "Death year must be between 1 and 2000" },
				{ status: 400 }
			);
		}

		// ── Build update payload ────────────────────────────────
		const update: Record<string, any> = {};
		if (body.name !== undefined) update.name = body.name;
		if (body.bio !== undefined) update.bio = body.bio;
		if (body.birth_year !== undefined) update.birth_year = body.birth_year;
		if (body.death_year !== undefined) update.death_year = body.death_year;

		if (Object.keys(update).length === 0) {
			return NextResponse.json(
				{ error: "No fields to update" },
				{ status: 400 }
			);
		}

		const supabase = await createAdminSupabaseClient();
		const { data, error } = await supabase
			.from("authors")
			.update(update)
			.eq("id", Number(id))
			.select(AUTHOR_SELECT)
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

/** DELETE /api/admin/authors/[id] — delete author (only if no books reference it) */
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
		const authorId = Number(id);
		const supabase = await createAdminSupabaseClient();

		// Check if any books reference this author
		const { count: bookCount } = await supabase
			.from("books")
			.select("id", { count: "exact", head: true })
			.or(`author_id.eq.${authorId},translator_id.eq.${authorId}`);

		if (bookCount && bookCount > 0) {
			return NextResponse.json(
				{
					error: `Cannot delete: ${bookCount} book(s) reference this author. Reassign them first.`,
				},
				{ status: 409 }
			);
		}

		const { error } = await supabase
			.from("authors")
			.delete()
			.eq("id", authorId);

		if (error) throw error;
		return NextResponse.json({ success: true });
	} catch (err: any) {
		return NextResponse.json(
			{ error: err.message ?? "Delete failed" },
			{ status: 500 }
		);
	}
};
