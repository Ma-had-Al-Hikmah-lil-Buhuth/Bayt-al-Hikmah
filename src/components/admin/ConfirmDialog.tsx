"use client";

import { AlertTriangle, X } from "lucide-react";
import { AdminButton } from "./AdminButton";

interface ConfirmDialogProps {
	open: boolean;
	title: string;
	message: string;
	confirmLabel?: string;
	cancelLabel?: string;
	variant?: "danger" | "primary";
	loading?: boolean;
	onConfirm: () => void;
	onCancel: () => void;
}

export function ConfirmDialog({
	open,
	title,
	message,
	confirmLabel = "Confirm",
	cancelLabel = "Cancel",
	variant = "danger",
	loading = false,
	onConfirm,
	onCancel,
}: ConfirmDialogProps) {
	if (!open) return null;

	return (
		<div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
			<div
				className="fixed inset-0 bg-black/50 backdrop-blur-sm"
				onClick={onCancel}
			/>
			<div className="relative w-full max-w-sm bg-[var(--color-surface)] rounded-2xl shadow-2xl border border-[var(--color-border)] p-6">
				<div className="flex items-start gap-4">
					<div
						className={`shrink-0 rounded-full p-2 ${
							variant === "danger"
								? "bg-red-50 text-red-600"
								: "bg-blue-50 text-blue-600"
						}`}
					>
						<AlertTriangle className="h-5 w-5" />
					</div>
					<div className="flex-1">
						<h3 className="font-semibold text-base">{title}</h3>
						<p className="text-sm text-[var(--color-text-muted)] mt-1">
							{message}
						</p>
					</div>
				</div>
				<div className="flex justify-end gap-3 mt-6">
					<AdminButton variant="ghost" size="sm" onClick={onCancel}>
						{cancelLabel}
					</AdminButton>
					<AdminButton
						variant={variant}
						size="sm"
						loading={loading}
						onClick={onConfirm}
					>
						{confirmLabel}
					</AdminButton>
				</div>
			</div>
		</div>
	);
}
