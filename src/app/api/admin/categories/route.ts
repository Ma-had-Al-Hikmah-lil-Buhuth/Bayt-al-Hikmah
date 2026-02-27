import { NextResponse } from "next/server";
import categories from "@/lib/categories.json";

/** GET /api/admin/categories — return categories from JSON */
export const GET = async () => {
	return NextResponse.json({ data: categories });
};
