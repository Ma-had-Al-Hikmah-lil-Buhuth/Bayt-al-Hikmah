"use client";

import { BookOpen, Loader2, Lock, Mail, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { localePath } from "@/lib/utils";

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function RegisterPage() {
	const router = useRouter();
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState(false);

	async function handleRegister(e: React.FormEvent) {
		e.preventDefault();
		setIsLoading(true);
		setError("");

		try {
			const supabase = createClient();
			const { error } = await supabase.auth.signUp({
				email,
				password,
				options: {
					data: { display_name: name },
				},
			});

			if (error) throw error;
			setSuccess(true);
		} catch (err: any) {
			setError(err.message);
		} finally {
			setIsLoading(false);
		}
	}

	if (success) {
		return (
			<div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4">
				<div className="text-center max-w-md space-y-4">
					<BookOpen className="mx-auto h-12 w-12 text-[var(--color-primary)]" />
					<h1 className="text-2xl font-bold">Check Your Email</h1>
					<p className="text-[var(--color-text-muted)]">
						We&apos;ve sent a confirmation link to{" "}
						<strong>{email}</strong>. Please verify your email to
						complete registration.
					</p>
					<Link
						href={localePath("/auth/login")}
						className="inline-block text-[var(--color-primary)] hover:underline font-medium"
					>
						Go to Login
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4">
			<div className="w-full max-w-md space-y-8">
				<div className="text-center">
					<BookOpen className="mx-auto h-12 w-12 text-[var(--color-primary)]" />
					<h1 className="mt-4 text-2xl font-bold">Create Account</h1>
					<p className="mt-2 text-sm text-[var(--color-text-muted)]">
						Join the Islamic Library to save bookmarks and track
						your reading.
					</p>
				</div>

				<div className="text-center">
					<p className="mt-2 text-sm text-[var(--color-text-muted)]">
						This feature is not yet implemented.
					</p>
				</div>

				<form onSubmit={handleRegister} className="space-y-4">
					{error && (
						<div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
							{error}
						</div>
					)}

					<div>
						<label className="text-sm font-medium block mb-1">
							Name
						</label>
						<div className="relative">
							<User className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
							<input
								type="text"
								value={name}
								onChange={(e) => setName(e.target.value)}
								required
								className="w-full rounded-lg border border-[var(--color-border)] ps-10 pe-4 py-2.5 text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
								placeholder="Your name"
							/>
						</div>
					</div>

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
						Create Account
					</button>
				</form>

				<p className="text-center text-sm text-[var(--color-text-muted)]">
					Already have an account?{" "}
					<Link
						href={localePath("/auth/login")}
						className="text-[var(--color-primary)] hover:underline font-medium"
					>
						Sign In
					</Link>
				</p>
			</div>
		</div>
	);
}
