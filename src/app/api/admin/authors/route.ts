import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";

/* eslint-disable @typescript-eslint/no-explicit-any */

const AUTHOR_SELECT = "id, name, bio, birth_year, death_year, created_at";

/** GET /api/admin/authors — list all authors */
export const GET = async (request: NextRequest) => {
	try {
		const supabase = await createAdminSupabaseClient();
		const url = request.nextUrl;
		const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
		const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit")) || 50));
		const offset = (page - 1) * limit;

		const { data, error, count } = await supabase
			.from("authors")
			.select(AUTHOR_SELECT, { count: "exact" })
			.order("created_at", { ascending: false })
			.range(offset, offset + limit - 1);

		if (error) throw error;
		return NextResponse.json({ data, total: count ?? data?.length ?? 0, page, limit });
	} catch (err: any) {
		return NextResponse.json(
			{ error: err.message ?? "Failed to fetch authors" },
			{ status: 500 }
		);
	}
};

/** POST /api/admin/authors — create author */
export const POST = async (request: NextRequest) => {
	try {
		const user = await getCurrentUser();
		if (!user?.isAdmin) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

		const body = await request.json();
		const name = body.name;
		const bio = body.bio ?? {};
		const birthYear = body.birth_year ?? null;
		const deathYear = body.death_year ?? null;

		// ── Validation ──────────────────────────────────────────
		if (!name || typeof name !== "object") {
			return NextResponse.json(
				{ error: "Author name is required as a JSONB object" },
				{ status: 400 }
			);
		}

		// At least one language key must have a non-empty value
		const hasName = Object.values(name).some(
			(v) => typeof v === "string" && v.trim().length > 0
		);
		if (!hasName) {
			return NextResponse.json(
				{ error: "At least one language name is required" },
				{ status: 400 }
			);
		}

		// Validate year range (Hijri years: 1 – ~1500+)
		if (birthYear !== null && (birthYear < 1 || birthYear > 2000)) {
			return NextResponse.json(
				{ error: "Birth year must be between 1 and 2000" },
				{ status: 400 }
			);
		}
		if (deathYear !== null && (deathYear < 1 || deathYear > 2000)) {
			return NextResponse.json(
				{ error: "Death year must be between 1 and 2000" },
				{ status: 400 }
			);
		}
		if (birthYear && deathYear && deathYear < birthYear) {
			return NextResponse.json(
				{ error: "Death year cannot be before birth year" },
				{ status: 400 }
			);
		}

		// ── Duplicate check ─────────────────────────────────────
		const supabase = await createAdminSupabaseClient();
		const nameEn = name.en?.trim();
		const nameAr = name.ar?.trim();

		if (nameEn || nameAr) {
			let dupeQuery = supabase
				.from("authors")
				.select("id, name")
				.limit(1);

			const orClauses: string[] = [];
			if (nameEn) orClauses.push(`name->>en.ilike.${nameEn}`);
			if (nameAr) orClauses.push(`name->>ar.ilike.${nameAr}`);

			dupeQuery = dupeQuery.or(orClauses.join(","));

			const { data: existing } = await dupeQuery;
			if (existing && existing.length > 0) {
				return NextResponse.json(
					{
						error: "An author with this name already exists",
						existing: existing[0],
					},
					{ status: 409 }
				);
			}
		}

		// ── Insert ──────────────────────────────────────────────
		const { data, error } = await supabase
			.from("authors")
			.insert({
				name,
				bio,
				birth_year: birthYear,
				death_year: deathYear,
			})
			.select(AUTHOR_SELECT)
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
