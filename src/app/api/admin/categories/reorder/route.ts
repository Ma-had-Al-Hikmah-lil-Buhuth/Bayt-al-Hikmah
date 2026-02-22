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

/** POST /api/admin/categories/reorder — bulk update sort_order */
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

    const { items } = await request.json();

    if (!Array.isArray(items)) {
      return NextResponse.json(
        { error: "items array is required" },
        { status: 400 }
      );
    }

    // Update each category's sort_order
    const updates = items.map(
      (item: { id: string; sort_order: number }) =>
        supabase
          .from("categories")
          .update({ sort_order: item.sort_order })
          .eq("id", item.id)
    );

    await Promise.all(updates);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message ?? "Reorder failed" },
      { status: 500 }
    );
  }
}
