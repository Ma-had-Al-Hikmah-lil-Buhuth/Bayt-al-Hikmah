import { NextResponse } from "next/server";

/** Categories are managed via JSON file, not the database */

export const PATCH = async () => {
	return NextResponse.json(
		{ error: "Categories are managed via the categories.json file" },
		{ status: 405 }
	);
};

export const DELETE = async () => {
	return NextResponse.json(
		{ error: "Categories are managed via the categories.json file" },
		{ status: 405 }
	);
};
