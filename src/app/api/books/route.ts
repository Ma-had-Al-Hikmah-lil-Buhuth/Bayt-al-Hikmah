import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/** GET /api/books — list books with optional filters */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";
  const category = searchParams.get("category");
  const language = searchParams.get("language");
  const era = searchParams.get("era");
  const page = parseInt(searchParams.get("page") ?? "1", 10);
  const limit = parseInt(searchParams.get("limit") ?? "20", 10);

  try {
    const supabase = await createServerSupabaseClient();

    if (query) {
      const { data, error } = await supabase.rpc("search_books", {
        search_query: query,
        lang_code: language || null,
        cat_slug: category || null,
        author_era: era || null,
        result_limit: limit,
        result_offset: (page - 1) * limit,
      });

      if (error) throw error;
      return NextResponse.json({ data, page, limit });
    }

    let qb = supabase
      .from("books")
      .select("*, author:authors(*), category:categories(*)", {
        count: "exact",
      });

    if (category) qb = qb.eq("category.slug", category);
    if (language) qb = qb.eq("language_code", language);

    qb = qb
      .order("view_count", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    const { data, count, error } = await qb;
    if (error) throw error;

    return NextResponse.json({
      data,
      total: count,
      page,
      limit,
      totalPages: Math.ceil((count ?? 0) / limit),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message ?? "Internal error" },
      { status: 500 },
    );
  }
}
