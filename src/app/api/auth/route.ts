import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { handleSignup } from "./handlers/signup";
import { handleLogin } from "./handlers/login";
import { removeAuthCookie } from "@/lib/auth";

export const POST = async (request: NextRequest) => {
	const { searchParams } = new URL(request.url);
	const action = searchParams.get("action");

	switch (action) {
		case "signup":
			return handleSignup(request);
		case "login":
			return handleLogin(request);
		case "logout":
			await removeAuthCookie();
			return NextResponse.json({ success: true }, { status: 200 });
		default:
			return NextResponse.json(
				{ error: "Invalid action. Use ?action=signup, ?action=login, or ?action=logout" },
				{ status: 400 }
			);
	}
};
