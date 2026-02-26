"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: "primary" | "secondary" | "danger" | "ghost";
	size?: "sm" | "md" | "lg";
	loading?: boolean;
	icon?: React.ReactNode;
}

export function AdminButton({
	variant = "primary",
	size = "md",
	loading = false,
	icon,
	children,
	className,
	disabled,
	...props
}: AdminButtonProps) {
	const base =
		"inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed";

	const variants = {
		primary:
			"bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] focus:ring-[var(--color-primary)]",
		secondary:
			"bg-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-text-muted)]/20 focus:ring-[var(--color-border)]",
		danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500",
		ghost: "text-[var(--color-text-muted)] hover:bg-[var(--color-border)] hover:text-[var(--color-text)] focus:ring-[var(--color-border)]",
	};

	const sizes = {
		sm: "px-3 py-1.5 text-xs",
		md: "px-4 py-2 text-sm",
		lg: "px-6 py-3 text-base",
	};

	return (
		<button
			className={cn(base, variants[variant], sizes[size], className)}
			disabled={disabled || loading}
			{...props}
		>
			{loading ? <Loader2 className="h-4 w-4 animate-spin" /> : icon}
			{children}
		</button>
	);
}
