import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { handleSignup } from "./handlers/signup";
import { handleLogin } from "./handlers/login";
import { removeAuthCookie, verifyToken } from "@/lib/auth";

export const GET = async (request: NextRequest) => {
	const { searchParams } = new URL(request.url);
	const action = searchParams.get("action");

	if (action === "me") {
		const token = request.cookies.get("auth-token")?.value;
		if (!token) {
			return NextResponse.json({ user: null }, { status: 401 });
		}
		const payload = await verifyToken(token);
		if (!payload) {
			return NextResponse.json({ user: null }, { status: 401 });
		}
		return NextResponse.json({
			user: {
				userId: payload.userId,
				email: payload.email,
				isAdmin: payload.isAdmin,
			},
		});
	}

	return NextResponse.json(
		{ error: "Invalid action. Use ?action=me" },
		{ status: 400 }
	);
};

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
