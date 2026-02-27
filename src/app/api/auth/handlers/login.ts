import { NextResponse } from "next/server";
import { verifyPassword, signToken, setAuthCookie } from "@/lib/auth";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

export const handleLogin = async (request: Request) => {
	try {
		const body = await request.json();
		const { email, password } = body;

		// ── Validation ──────────────────────────────────────────────
		if (!email || !password) {
			return NextResponse.json(
				{ error: "Email and password are required." },
				{ status: 400 }
			);
		}

		if (typeof email !== "string" || !email.includes("@")) {
			return NextResponse.json(
				{ error: "A valid email is required." },
				{ status: 400 }
			);
		}

		const supabase = await createAdminSupabaseClient();

		// ── Find user by email ──────────────────────────────────────
		const { data: user, error: fetchError } = await supabase
			.from("users")
			.select("id, name, email, password, is_admin")
			.eq("email", email.toLowerCase().trim())
			.single();

		if (fetchError || !user) {
			return NextResponse.json(
				{ error: "Invalid email or password." },
				{ status: 401 }
			);
		}

		// ── Verify password ─────────────────────────────────────────
		const isValid = await verifyPassword(password, user.password);

		if (!isValid) {
			return NextResponse.json(
				{ error: "Invalid email or password." },
				{ status: 401 }
			);
		}

		// ── Sign JWT & set cookie ───────────────────────────────────
		const token = await signToken({
			userId: user.id,
			email: user.email,
			isAdmin: user.is_admin,
		});

		await setAuthCookie(token);

		return NextResponse.json(
			{
				user: {
					id: user.id,
					name: user.name,
					email: user.email,
					isAdmin: user.is_admin,
				},
			},
			{ status: 200 }
		);
	} catch (err) {
		console.error("Login error:", err);
		return NextResponse.json(
			{ error: "Internal server error." },
			{ status: 500 }
		);
	}
};
