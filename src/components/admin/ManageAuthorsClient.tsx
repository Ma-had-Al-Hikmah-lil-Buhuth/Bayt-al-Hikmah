"use client";

import { useState } from "react";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Users,
  Calendar,
} from "lucide-react";
import { t, cn } from "@/lib/utils";
import { AdminButton } from "./AdminButton";
import { ConfirmDialog } from "./ConfirmDialog";
import { Modal } from "./Modal";
import type { Locale } from "@/types/database";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface ManageAuthorsClientProps {
  locale: Locale;
  dict: any;
  initialAuthors: any[];
}

export function ManageAuthorsClient({
  locale,
  dict,
  initialAuthors,
}: ManageAuthorsClientProps) {
  const [authors, setAuthors] = useState(initialAuthors);
  const [search, setSearch] = useState("");
  const [filterEra, setFilterEra] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editTarget, setEditTarget] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const a = dict.admin;

  const filtered = authors.filter((author: any) => {
    const name = t(author.name, locale).toLowerCase();
    const matchesSearch = !search || name.includes(search.toLowerCase());
    const matchesEra = !filterEra || author.era === filterEra;
    return matchesSearch && matchesEra;
  });

  const eras = [...new Set(authors.map((a: any) => a.era).filter(Boolean))];

  async function handleCreateOrEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);

    const form = new FormData(e.currentTarget);
    const name: Record<string, string> = {};
    const bio: Record<string, string> = {};
    for (const lang of ["en", "ar", "bn", "ur"]) {
      const nVal = form.get(`name_${lang}`) as string;
      const bVal = form.get(`bio_${lang}`) as string;
      if (nVal?.trim()) name[lang] = nVal.trim();
      if (bVal?.trim()) bio[lang] = bVal.trim();
    }

    const payload = {
      name,
      bio,
      era: form.get("era") as string || null,
      birth_date_hijri: form.get("birth_date_hijri") as string || null,
      death_date_hijri: form.get("death_date_hijri") as string || null,
      photo_url: form.get("photo_url") as string || null,
    };

    try {
      const isEdit = !!editTarget;
      const url = isEdit
        ? `/api/admin/authors/${editTarget.id}`
        : "/api/admin/authors";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const { data } = await res.json();
        if (isEdit) {
          setAuthors((prev: any[]) =>
            prev.map((a: any) => (a.id === editTarget.id ? data : a))
          );
          setEditTarget(null);
        } else {
          setAuthors((prev: any[]) => [data, ...prev]);
          setShowCreate(false);
        }
      }
    } catch {
      // Error
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/authors/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setAuthors((prev: any[]) =>
          prev.filter((a: any) => a.id !== deleteTarget.id)
        );
      }
    } catch {
      // Error
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  function AuthorForm({ author }: { author?: any }) {
    return (
      <form onSubmit={handleCreateOrEdit} className="space-y-4">
        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold">Name (Multilingual)</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(["en", "ar", "bn", "ur"] as const).map((lang) => (
              <div key={lang}>
                <label className="text-xs text-[var(--color-text-muted)] uppercase">
                  {lang}
                </label>
                <input
                  name={`name_${lang}`}
                  defaultValue={author?.name?.[lang] || ""}
                  dir={lang === "ar" || lang === "ur" ? "rtl" : "ltr"}
                  required={lang === "en"}
                  className="w-full mt-1 rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
                  placeholder={`Name in ${lang.toUpperCase()}`}
                />
              </div>
            ))}
          </div>
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold">Bio (Multilingual)</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(["en", "ar", "bn", "ur"] as const).map((lang) => (
              <div key={lang}>
                <label className="text-xs text-[var(--color-text-muted)] uppercase">
                  {lang}
                </label>
                <textarea
                  name={`bio_${lang}`}
                  defaultValue={author?.bio?.[lang] || ""}
                  dir={lang === "ar" || lang === "ur" ? "rtl" : "ltr"}
                  rows={2}
                  className="w-full mt-1 rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none resize-y"
                  placeholder={`Bio in ${lang.toUpperCase()}`}
                />
              </div>
            ))}
          </div>
        </fieldset>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-semibold block mb-1">Era</label>
            <select
              name="era"
              defaultValue={author?.era || ""}
              className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
            >
              <option value="">Select era...</option>
              <option value="Classical">Classical</option>
              <option value="Medieval">Medieval</option>
              <option value="Contemporary">Contemporary</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold block mb-1">Birth (Hijri)</label>
            <input
              name="birth_date_hijri"
              defaultValue={author?.birth_date_hijri || ""}
              className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
              placeholder="e.g. 661 AH"
            />
          </div>
          <div>
            <label className="text-sm font-semibold block mb-1">Death (Hijri)</label>
            <input
              name="death_date_hijri"
              defaultValue={author?.death_date_hijri || ""}
              className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
              placeholder="e.g. 728 AH"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold block mb-1">Photo URL</label>
          <input
            name="photo_url"
            defaultValue={author?.photo_url || ""}
            type="url"
            className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
            placeholder="https://..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <AdminButton
            type="button"
            variant="ghost"
            onClick={() => {
              setShowCreate(false);
              setEditTarget(null);
            }}
          >
            Cancel
          </AdminButton>
          <AdminButton type="submit" loading={saving}>
            {author ? "Save Changes" : "Create Author"}
          </AdminButton>
        </div>
      </form>
    );
  }

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-[var(--color-primary)]" />
            {a.manageAuthors}
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            {filtered.length} of {authors.length} authors
          </p>
        </div>
        <AdminButton
          icon={<Plus className="h-4 w-4" />}
          onClick={() => setShowCreate(true)}
        >
          Add Author
        </AdminButton>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search authors..."
            className="w-full ps-10 pe-4 py-2.5 rounded-xl border border-[var(--color-border)] text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none bg-[var(--color-surface)]"
          />
        </div>
        <select
          value={filterEra}
          onChange={(e) => setFilterEra(e.target.value)}
          className="rounded-xl border border-[var(--color-border)] px-3 py-2.5 text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none bg-[var(--color-surface)]"
        >
          <option value="">All Eras</option>
          {eras.map((era) => (
            <option key={era} value={era}>
              {era}
            </option>
          ))}
        </select>
      </div>

      {/* Authors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full text-center py-12 text-[var(--color-text-muted)]">
            No authors found.
          </div>
        ) : (
          filtered.map((author: any) => (
            <div
              key={author.id}
              className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                {author.photo_url ? (
                  <img
                    src={author.photo_url}
                    alt=""
                    className="h-14 w-14 rounded-xl object-cover border border-[var(--color-border)]"
                  />
                ) : (
                  <div className="h-14 w-14 rounded-xl bg-[var(--color-primary)]/10 flex items-center justify-center shrink-0">
                    <Users className="h-6 w-6 text-[var(--color-primary)]" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">
                    {t(author.name, locale)}
                  </h3>
                  {author.era && (
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs bg-[var(--color-border)] text-[var(--color-text-muted)]">
                      {author.era}
                    </span>
                  )}
                  {(author.birth_date_hijri || author.death_date_hijri) && (
                    <p className="text-xs text-[var(--color-text-muted)] mt-1 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {author.birth_date_hijri || "?"} — {author.death_date_hijri || "?"}
                    </p>
                  )}
                  {author.bio?.en && (
                    <p className="text-xs text-[var(--color-text-muted)] mt-2 line-clamp-2">
                      {author.bio.en}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-1 mt-4 pt-3 border-t border-[var(--color-border)]">
                <button
                  onClick={() => setEditTarget(author)}
                  className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  title="Edit"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setDeleteTarget(author)}
                  className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:bg-red-50 hover:text-red-600 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Modal */}
      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="Add New Author"
        maxWidth="max-w-2xl"
      >
        <AuthorForm />
      </Modal>

      {/* Edit Modal */}
      <Modal
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        title="Edit Author"
        maxWidth="max-w-2xl"
      >
        {editTarget && <AuthorForm author={editTarget} />}
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Author"
        message={`Are you sure you want to delete "${deleteTarget ? t(deleteTarget.name, locale) : ""}"? Books by this author must be reassigned first.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
