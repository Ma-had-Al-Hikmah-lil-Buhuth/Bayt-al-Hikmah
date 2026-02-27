import { NextResponse } from "next/server";
import { hashPassword, setAuthCookie, signToken } from "@/lib/auth";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

export const handleSignup = async (request: Request) => {
	try {
		const body = await request.json();
		const { name, email, password } = body;

		// ── Validation ──────────────────────────────────────────────
		if (!name || !email || !password) {
			return NextResponse.json(
				{ error: "Name, email, and password are required." },
				{ status: 400 }
			);
		}

		if (typeof name !== "string" || name.trim().length < 2) {
			return NextResponse.json(
				{ error: "Name must be at least 2 characters." },
				{ status: 400 }
			);
		}

		if (typeof email !== "string" || !email.includes("@")) {
			return NextResponse.json(
				{ error: "A valid email is required." },
				{ status: 400 }
			);
		}

		if (typeof password !== "string" || password.length < 6) {
			return NextResponse.json(
				{ error: "Password must be at least 6 characters." },
				{ status: 400 }
			);
		}

		const supabase = await createAdminSupabaseClient();

		// ── Check if user already exists ────────────────────────────
		const { data: existing } = await supabase
			.from("users")
			.select("id")
			.eq("email", email.toLowerCase().trim())
			.single();

		if (existing) {
			return NextResponse.json(
				{ error: "An account with this email already exists." },
				{ status: 409 }
			);
		}

		// ── Hash password & insert user ─────────────────────────────
		const hashedPassword = await hashPassword(password);

		const { data: user, error: insertError } = await supabase
			.from("users")
			.insert({
				name: name.trim(),
				email: email.toLowerCase().trim(),
				password: hashedPassword,
				is_admin: false,
			})
			.select("id, name, email, is_admin")
			.single();

		if (insertError || !user) {
			console.error("Signup insert error:", insertError);
			return NextResponse.json(
				{ error: "Failed to create account. Please try again." },
				{ status: 500 }
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
			{ status: 201 }
		);
	} catch (err) {
		console.error("Signup error:", err);
		return NextResponse.json(
			{ error: "Internal server error." },
			{ status: 500 }
		);
	}
};
