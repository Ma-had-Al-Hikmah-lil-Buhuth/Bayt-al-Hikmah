"use client";

import { useState } from "react";
import {
	Search,
	UserCog,
	ShieldAlert,
	Shield,
	User,
	Mail,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "./ConfirmDialog";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface ManageUsersClientProps {
	dict: any;
	initialUsers: any[];
}

export function ManageUsersClient({
	dict,
	initialUsers,
}: ManageUsersClientProps) {
	const [users, setUsers] = useState(initialUsers);
	const [search, setSearch] = useState("");
	const [filterAdmin, setFilterAdmin] = useState<"all" | "admin" | "user">(
		"all"
	);
	const [toggleTarget, setToggleTarget] = useState<any>(null);
	const [saving, setSaving] = useState(false);
	const a = dict.admin;

	const filtered = users.filter((user: any) => {
		const name = (user.name || user.email || "").toLowerCase();
		const matchesSearch = !search || name.includes(search.toLowerCase());
		const matchesFilter =
			filterAdmin === "all" ||
			(filterAdmin === "admin" && user.is_admin) ||
			(filterAdmin === "user" && !user.is_admin);
		return matchesSearch && matchesFilter;
	});

	const adminCount = users.filter((u: any) => u.is_admin).length;
	const userCount = users.length - adminCount;

	async function handleToggleAdmin() {
		if (!toggleTarget) return;
		setSaving(true);
		try {
			const res = await fetch(`/api/admin/users/${toggleTarget.id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ is_admin: !toggleTarget.is_admin }),
			});
			if (res.ok) {
				setUsers((prev: any[]) =>
					prev.map((u: any) =>
						u.id === toggleTarget.id
							? { ...u, is_admin: !toggleTarget.is_admin }
							: u
					)
				);
			}
		} catch {
			// Error
		} finally {
			setSaving(false);
			setToggleTarget(null);
		}
	}

	return (
		<div className="px-4 py-8 sm:px-6 lg:px-8">
			{/* Header */}
			<div className="mb-6">
				<h1 className="text-2xl font-bold flex items-center gap-2">
					<UserCog className="h-6 w-6 text-[var(--color-primary)]" />
					{a.manageUsers || "Manage Users"}
				</h1>
				<p className="text-sm text-[var(--color-text-muted)] mt-1">
					{users.length} total users
				</p>
			</div>

			{/* Stats */}
			<div className="grid grid-cols-2 gap-4 mb-6">
				<button
					onClick={() =>
						setFilterAdmin(
							filterAdmin === "admin" ? "all" : "admin"
						)
					}
					className={cn(
						"rounded-xl border p-4 text-start transition-all",
						filterAdmin === "admin"
							? "border-[var(--color-primary)] shadow-md"
							: "border-[var(--color-border)] hover:border-[var(--color-primary)]/50"
					)}
				>
					<div className="flex items-center gap-3">
						<div className="rounded-lg p-2 text-red-600 bg-red-50">
							<ShieldAlert className="h-4 w-4" />
						</div>
						<div>
							<p className="text-xl font-bold">{adminCount}</p>
							<p className="text-xs text-[var(--color-text-muted)]">
								Admins
							</p>
						</div>
					</div>
				</button>
				<button
					onClick={() =>
						setFilterAdmin(
							filterAdmin === "user" ? "all" : "user"
						)
					}
					className={cn(
						"rounded-xl border p-4 text-start transition-all",
						filterAdmin === "user"
							? "border-[var(--color-primary)] shadow-md"
							: "border-[var(--color-border)] hover:border-[var(--color-primary)]/50"
					)}
				>
					<div className="flex items-center gap-3">
						<div className="rounded-lg p-2 text-green-600 bg-green-50">
							<Shield className="h-4 w-4" />
						</div>
						<div>
							<p className="text-xl font-bold">{userCount}</p>
							<p className="text-xs text-[var(--color-text-muted)]">
								Users
							</p>
						</div>
					</div>
				</button>
			</div>

			{/* Search */}
			<div className="relative max-w-md mb-6">
				<Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
				<input
					type="text"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					placeholder="Search users..."
					className="w-full ps-10 pe-4 py-2.5 rounded-xl border border-[var(--color-border)] text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none bg-[var(--color-surface)]"
				/>
			</div>

			{/* Users Table */}
			<div className="rounded-2xl border border-[var(--color-border)] overflow-hidden bg-[var(--color-surface)]">
				<div className="overflow-x-auto">
					<table className="w-full text-sm">
						<thead>
							<tr className="border-b border-[var(--color-border)] bg-[var(--color-bg)]">
								<th className="text-start px-4 py-3 font-semibold">
									User
								</th>
								<th className="text-start px-4 py-3 font-semibold">
									Status
								</th>
								<th className="text-start px-4 py-3 font-semibold hidden md:table-cell">
									Joined
								</th>
								<th className="text-end px-4 py-3 font-semibold">
									Actions
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-[var(--color-border)]">
							{filtered.length === 0 ? (
								<tr>
									<td
										colSpan={4}
										className="px-4 py-12 text-center text-[var(--color-text-muted)]"
									>
										No users found.
									</td>
								</tr>
							) : (
								filtered.map((user: any) => (
									<tr
										key={user.id}
										className="hover:bg-[var(--color-bg)] transition-colors"
									>
										<td className="px-4 py-3">
											<div className="flex items-center gap-3">
												<div className="h-9 w-9 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center">
													<User className="h-4 w-4 text-[var(--color-primary)]" />
												</div>
												<div className="min-w-0">
													<p className="font-medium truncate">
														{user.name ||
															"Unnamed User"}
													</p>
													<p className="text-xs text-[var(--color-text-muted)] truncate flex items-center gap-1">
														<Mail className="h-3 w-3" />
														{user.email}
													</p>
												</div>
											</div>
										</td>
										<td className="px-4 py-3">
											{user.is_admin ? (
												<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-red-600 bg-red-50">
													<ShieldAlert className="h-3 w-3" />
													Admin
												</span>
											) : (
												<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium text-green-600 bg-green-50">
													<Shield className="h-3 w-3" />
													User
												</span>
											)}
										</td>
										<td className="px-4 py-3 hidden md:table-cell text-[var(--color-text-muted)] text-xs">
											{new Date(
												user.created_at
											).toLocaleDateString()}
										</td>
										<td className="px-4 py-3">
											<div className="flex justify-end">
												<button
													onClick={() =>
														setToggleTarget(user)
													}
													className={cn(
														"rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
														user.is_admin
															? "border-red-200 text-red-600 hover:bg-red-50"
															: "border-blue-200 text-blue-600 hover:bg-blue-50"
													)}
												>
													{user.is_admin
														? "Remove Admin"
														: "Make Admin"}
												</button>
											</div>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>
			</div>

			{/* Toggle Admin Confirm */}
			<ConfirmDialog
				open={!!toggleTarget}
				title={
					toggleTarget?.is_admin
						? "Remove Admin Access"
						: "Grant Admin Access"
				}
				message={`${toggleTarget?.is_admin ? "Remove admin privileges from" : "Grant admin privileges to"} "${toggleTarget?.name || toggleTarget?.email || "this user"}"?`}
				confirmLabel={
					toggleTarget?.is_admin ? "Remove Admin" : "Make Admin"
				}
				variant={toggleTarget?.is_admin ? "danger" : "primary"}
				loading={saving}
				onConfirm={handleToggleAdmin}
				onCancel={() => setToggleTarget(null)}
			/>
		</div>
	);
}
