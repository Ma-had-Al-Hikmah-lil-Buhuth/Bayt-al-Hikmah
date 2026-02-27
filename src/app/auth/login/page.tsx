"use client";

import { BookOpen, Loader2, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { localePath } from "@/lib/utils";

export default function LoginPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const redirectTo = searchParams.get("redirect") || "/";
	const unauthorized = searchParams.get("unauthorized");

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		if (unauthorized === "true") {
			toast.error("You are not authorized. Please contact the site owner.");
		}
	}, [unauthorized]);

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);
		setError("");

		try {
			const res = await fetch("/api/auth?action=login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, password }),
			});

			const data = await res.json();

			if (!res.ok) {
				throw new Error(data.error || "Login failed.");
			}

			toast.success("Logged in successfully!");
			router.push(redirectTo);
			router.refresh();
		} catch (err: unknown) {
			const message =
				err instanceof Error ? err.message : "Something went wrong.";
			setError(message);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4">
			<div className="w-full max-w-md space-y-8">
				<div className="text-center">
					<BookOpen className="mx-auto h-12 w-12 text-[var(--color-primary)]" />
					<h1 className="mt-4 text-2xl font-bold">Welcome Back</h1>
					<p className="mt-2 text-sm text-[var(--color-text-muted)]">
						Sign in to access your account and the Islamic Library.
					</p>
				</div>

				<form onSubmit={handleLogin} className="space-y-4">
					{error && (
						<div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
							{error}
						</div>
					)}

					<div>
						<label className="text-sm font-medium block mb-1">
							Email
						</label>
						<div className="relative">
							<Mail className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
							<input
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
								className="w-full rounded-lg border border-[var(--color-border)] ps-10 pe-4 py-2.5 text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
								placeholder="you@example.com"
							/>
						</div>
					</div>

					<div>
						<label className="text-sm font-medium block mb-1">
							Password
						</label>
						<div className="relative">
							<Lock className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
							<input
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
								minLength={6}
								className="w-full rounded-lg border border-[var(--color-border)] ps-10 pe-4 py-2.5 text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
								placeholder="••••••••"
							/>
						</div>
					</div>

					<button
						type="submit"
						disabled={isLoading}
						className="w-full flex items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50"
					>
						{isLoading && (
							<Loader2 className="h-4 w-4 animate-spin" />
						)}
						Sign In
					</button>
				</form>

				<p className="text-center text-sm text-[var(--color-text-muted)]">
					Don&apos;t have an account?{" "}
					<Link
						href={localePath("/auth/register")}
						className="text-[var(--color-primary)] hover:underline font-medium"
					>
						Create Account
					</Link>
				</p>
			</div>
		</div>
	);
}
