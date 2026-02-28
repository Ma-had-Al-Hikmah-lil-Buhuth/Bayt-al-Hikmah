import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { MultiLang } from "@/types/database";

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

/** Resolve a multilingual JSONB field — prefer English, then first available */
export function t(field: MultiLang | undefined | null): string {
	if (!field) return "";
	if (typeof field === "string") return field;
	return field.en || Object.values(field).find(Boolean) || "";
}

/** Format large numbers (1200 → 1.2K) */
export function formatCount(n: number): string {
	if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
	if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
	return String(n);
}

/** Truncate text to a max length */
export function truncate(str: string, max: number): string {
	if (str.length <= max) return str;
	return str.slice(0, max).trimEnd() + "…";
}

/** Build a path (locale prefix removed — English only for now) */
export function localePath(path: string): string {
	return path.startsWith("/") ? path : `/${path}`;
}

/** Slugify a string (ascii + arabic-safe) */
export function slugify(text: string): string {
	return text
		.toString()
		.toLowerCase()
		.trim()
		.replace(/\s+/g, "-")
		.replace(/[^\w\u0600-\u06FF-]+/g, "") // keep arabic chars
		.replace(/--+/g, "-")
		.replace(/^-+|-+$/g, "");
}
