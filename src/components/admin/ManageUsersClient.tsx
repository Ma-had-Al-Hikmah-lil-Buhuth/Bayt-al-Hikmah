"use client";

import { useState } from "react";
import {
  Search,
  UserCog,
  Shield,
  ShieldCheck,
  ShieldAlert,
  User,
  Mail,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AdminButton } from "./AdminButton";
import { ConfirmDialog } from "./ConfirmDialog";
import type { Locale } from "@/types/database";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface ManageUsersClientProps {
  locale: Locale;
  dict: any;
  initialUsers: any[];
}

const ROLE_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
  admin: {
    label: "Admin",
    icon: ShieldAlert,
    color: "text-red-600 bg-red-50",
  },
  editor: {
    label: "Editor",
    icon: ShieldCheck,
    color: "text-blue-600 bg-blue-50",
  },
  reader: {
    label: "Reader",
    icon: Shield,
    color: "text-green-600 bg-green-50",
  },
};

export function ManageUsersClient({
  locale,
  dict,
  initialUsers,
}: ManageUsersClientProps) {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [roleChangeTarget, setRoleChangeTarget] = useState<{
    user: any;
    newRole: string;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const a = dict.admin;

  const filtered = users.filter((user: any) => {
    const name = (user.display_name || "").toLowerCase();
    const matchesSearch = !search || name.includes(search.toLowerCase());
    const matchesRole = !filterRole || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const roleCounts = users.reduce(
    (acc: Record<string, number>, u: any) => {
      acc[u.role] = (acc[u.role] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  async function handleRoleChange() {
    if (!roleChangeTarget) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${roleChangeTarget.user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: roleChangeTarget.newRole }),
      });
      if (res.ok) {
        setUsers((prev: any[]) =>
          prev.map((u: any) =>
            u.id === roleChangeTarget.user.id
              ? { ...u, role: roleChangeTarget.newRole }
              : u
          )
        );
      }
    } catch {
      // Error
    } finally {
      setSaving(false);
      setRoleChangeTarget(null);
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

      {/* Role Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {(["admin", "editor", "reader"] as const).map((role) => {
          const config = ROLE_CONFIG[role];
          const Icon = config.icon;
          return (
            <button
              key={role}
              onClick={() => setFilterRole(filterRole === role ? "" : role)}
              className={cn(
                "rounded-xl border p-4 text-start transition-all",
                filterRole === role
                  ? "border-[var(--color-primary)] shadow-md"
                  : "border-[var(--color-border)] hover:border-[var(--color-primary)]/50"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn("rounded-lg p-2", config.color)}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xl font-bold">{roleCounts[role] || 0}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    {config.label}s
                  </p>
                </div>
              </div>
            </button>
          );
        })}
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
                <th className="text-start px-4 py-3 font-semibold">User</th>
                <th className="text-start px-4 py-3 font-semibold hidden sm:table-cell">
                  Language
                </th>
                <th className="text-start px-4 py-3 font-semibold">Role</th>
                <th className="text-start px-4 py-3 font-semibold hidden md:table-cell">
                  Joined
                </th>
                <th className="text-end px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-12 text-center text-[var(--color-text-muted)]"
                  >
                    No users found.
                  </td>
                </tr>
              ) : (
                filtered.map((user: any) => {
                  const roleConfig = ROLE_CONFIG[user.role] || ROLE_CONFIG.reader;
                  const RoleIcon = roleConfig.icon;
                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-[var(--color-bg)] transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {user.avatar_url ? (
                            <img
                              src={user.avatar_url}
                              alt=""
                              className="h-9 w-9 rounded-full object-cover border border-[var(--color-border)]"
                            />
                          ) : (
                            <div className="h-9 w-9 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center">
                              <User className="h-4 w-4 text-[var(--color-primary)]" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-medium truncate">
                              {user.display_name || "Unnamed User"}
                            </p>
                            <p className="text-xs text-[var(--color-text-muted)] truncate">
                              {user.id.slice(0, 8)}...
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell text-[var(--color-text-muted)]">
                        <span className="uppercase text-xs font-medium">
                          {user.preferred_lang || "en"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                            roleConfig.color
                          )}
                        >
                          <RoleIcon className="h-3 w-3" />
                          {roleConfig.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell text-[var(--color-text-muted)] text-xs">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end">
                          <select
                            value={user.role}
                            onChange={(e) =>
                              setRoleChangeTarget({
                                user,
                                newRole: e.target.value,
                              })
                            }
                            className="rounded-lg border border-[var(--color-border)] px-2 py-1 text-xs focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none bg-[var(--color-surface)]"
                          >
                            <option value="reader">Reader</option>
                            <option value="editor">Editor</option>
                            <option value="admin">Admin</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Change Confirm */}
      <ConfirmDialog
        open={!!roleChangeTarget}
        title="Change User Role"
        message={`Change "${roleChangeTarget?.user?.display_name || "this user"}" role to ${roleChangeTarget?.newRole || ""}?`}
        confirmLabel="Change Role"
        variant="primary"
        loading={saving}
        onConfirm={handleRoleChange}
        onCancel={() => setRoleChangeTarget(null)}
      />
    </div>
  );
}
