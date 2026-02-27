import { type NextRequest, NextResponse } from "next/server";
import { verifyTokenFromString } from "@/lib/auth";

const PUBLIC_FILE = /\.(.*)$/;

export const proxy = async (request: NextRequest) => {
	const { pathname } = request.nextUrl;

	// Skip public files and API routes
	if (PUBLIC_FILE.test(pathname) || pathname.startsWith("/api")) {
		return NextResponse.next();
	}

	// ── Admin route protection ────────────────────────────────────────────────
	if (pathname.startsWith("/admin")) {
		const token = request.cookies.get("auth-token")?.value;

		if (!token) {
			const loginUrl = new URL("/auth/login", request.url);
			loginUrl.searchParams.set("redirect", pathname);
			return NextResponse.redirect(loginUrl);
		}

		const user = await verifyTokenFromString(token);

		if (!user) {
			const loginUrl = new URL("/auth/login", request.url);
			loginUrl.searchParams.set("redirect", pathname);
			return NextResponse.redirect(loginUrl);
		}

		if (!user.isAdmin) {
			const loginUrl = new URL("/auth/login", request.url);
			loginUrl.searchParams.set("unauthorized", "true");
			return NextResponse.redirect(loginUrl);
		}
	}

	return NextResponse.next();
};

export const config = {
	matcher: [
		"/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
	],
};
