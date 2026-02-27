import { SignJWT, jwtVerify } from "jose";
import { hash, compare } from "bcryptjs";
import { cookies } from "next/headers";

// ─── Config ─────────────────────────────────────────────────────────────────

const JWT_SECRET = new TextEncoder().encode(
	process.env.JWT_SECRET || "fallback-dev-secret-change-in-production"
);

const COOKIE_NAME = "auth-token";
const TOKEN_EXPIRY = "7d";
const SALT_ROUNDS = 12;

// ─── JWT payload shape ──────────────────────────────────────────────────────

export interface JWTPayload {
	userId: string;
	email: string;
	isAdmin: boolean;
}

// ─── Password helpers ───────────────────────────────────────────────────────

export const hashPassword = async (password: string): Promise<string> => {
	return hash(password, SALT_ROUNDS);
};

export const verifyPassword = async (
	password: string,
	hashed: string
): Promise<boolean> => {
	return compare(password, hashed);
};

// ─── JWT helpers ────────────────────────────────────────────────────────────

export const signToken = async (payload: JWTPayload): Promise<string> => {
	return new SignJWT({ ...payload })
		.setProtectedHeader({ alg: "HS256" })
		.setIssuedAt()
		.setExpirationTime(TOKEN_EXPIRY)
		.sign(JWT_SECRET);
};

export const verifyToken = async (
	token: string
): Promise<JWTPayload | null> => {
	try {
		const { payload } = await jwtVerify(token, JWT_SECRET);
		return payload as unknown as JWTPayload;
	} catch {
		return null;
	}
};

// ─── Cookie helpers ─────────────────────────────────────────────────────────

export const setAuthCookie = async (token: string) => {
	const cookieStore = await cookies();
	cookieStore.set(COOKIE_NAME, token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		path: "/",
		maxAge: 60 * 60 * 24 * 7, // 7 days
	});
};

export const getAuthCookie = async (): Promise<string | undefined> => {
	const cookieStore = await cookies();
	return cookieStore.get(COOKIE_NAME)?.value;
};

export const removeAuthCookie = async () => {
	const cookieStore = await cookies();
	cookieStore.set(COOKIE_NAME, "", {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		path: "/",
		maxAge: 0,
	});
};

// ─── Get current user from cookie (for server components) ───────────────────

export const getCurrentUser = async (): Promise<JWTPayload | null> => {
	const token = await getAuthCookie();
	if (!token) return null;
	return verifyToken(token);
};

// ─── Verify token from raw string (for middleware — no cookies import) ──────

export const verifyTokenFromString = async (
	token: string
): Promise<JWTPayload | null> => {
	try {
		const { payload } = await jwtVerify(token, JWT_SECRET);
		return payload as unknown as JWTPayload;
	} catch {
		return null;
	}
};
