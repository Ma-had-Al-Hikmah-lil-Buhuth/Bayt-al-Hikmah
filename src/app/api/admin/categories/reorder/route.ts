import { NextResponse } from "next/server";

/** Categories are managed via JSON file — reordering not supported via API */
export const POST = async () => {
	return NextResponse.json(
		{ error: "Categories are managed via the categories.json file" },
		{ status: 405 }
	);
};
