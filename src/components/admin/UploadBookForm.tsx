"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
	Upload,
	Loader2,
	X,
	Plus,
	Search,
	BookOpen,
	Languages,
	Tag,
	UserPen,
	FileText,
	Image as ImageIcon,
	Settings2,
	Link2,
	ChevronDown,
	Check,
} from "lucide-react";
import { localePath, t } from "@/lib/utils";

/* eslint-disable @typescript-eslint/no-explicit-any */

// ─── Debounce hook ──────────────────────────────────────────────────────────

const useDebounce = (value: string, delay: number) => {
	const [debounced, setDebounced] = useState(value);
	useEffect(() => {
		const timer = setTimeout(() => setDebounced(value), delay);
		return () => clearTimeout(timer);
	}, [value, delay]);
	return debounced;
};

// ─── Searchable Select ──────────────────────────────────────────────────────

interface SearchablePersonProps {
	label: string;
	placeholder: string;
	apiUrl: string;
	value: { id: string; name: string } | null;
	onChange: (val: { id: string; name: string } | null) => void;
	required?: boolean;
	showAddNew?: boolean;
}

const SearchablePerson = ({
	label,
	placeholder,
	apiUrl,
	value,
	onChange,
	required,
	showAddNew,
}: SearchablePersonProps) => {
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<any[]>([]);
	const [isOpen, setIsOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const debouncedQuery = useDebounce(query, 300);
	const wrapperRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const fetchResults = async () => {
			setLoading(true);
			try {
				const res = await fetch(`${apiUrl}?q=${encodeURIComponent(debouncedQuery)}`);
				if (res.ok) {
					const data = await res.json();
					setResults(data.data ?? []);
				}
			} catch {
				// ignore
			} finally {
				setLoading(false);
			}
		};
		if (isOpen) fetchResults();
	}, [debouncedQuery, apiUrl, isOpen]);

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
				setIsOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const handleSelect = (item: any) => {
		onChange({ id: item.id, name: t(item.name) });
		setQuery("");
		setIsOpen(false);
	};

	const handleAddNew = () => {
		window.open(localePath("/admin/authors"), "_blank");
	};

	if (value) {
		return (
			<div>
				<label className="text-sm font-semibold block mb-1.5">{label}</label>
				<div className="flex items-center gap-2 rounded-lg border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/5 px-3 py-2.5">
					<UserPen className="h-4 w-4 text-[var(--color-primary)] shrink-0" />
					<span className="text-sm font-medium flex-1">{value.name}</span>
					<button
						type="button"
						onClick={() => onChange(null)}
						className="p-0.5 rounded hover:bg-[var(--color-border)] transition-colors cursor-pointer"
					>
						<X className="h-3.5 w-3.5 text-[var(--color-text-muted)]" />
					</button>
				</div>
			</div>
		);
	}

	return (
		<div ref={wrapperRef} className="relative">
			<label className="text-sm font-semibold block mb-1.5">
				{label} {required && <span className="text-red-400">*</span>}
			</label>
			<div className="relative">
				<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
				<input
					type="text"
					value={query}
					onChange={(e) => {
						setQuery(e.target.value);
						setIsOpen(true);
					}}
					onFocus={() => setIsOpen(true)}
					placeholder={placeholder}
					className="w-full rounded-lg border border-[var(--color-border)] pl-9 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
				/>
				{loading && (
					<Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-[var(--color-text-muted)]" />
				)}
			</div>
			{isOpen && (
				<div className="absolute z-30 w-full mt-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg max-h-56 overflow-y-auto">
					{results.length === 0 && !loading && (
						<div className="px-3 py-4 text-sm text-[var(--color-text-muted)] text-center">
							No results found
						</div>
					)}
					{results.map((item) => (
						<button
							key={item.id}
							type="button"
							onClick={() => handleSelect(item)}
							className="w-full text-left px-3 py-2.5 text-sm hover:bg-[var(--color-border)] transition-colors flex items-center gap-2 cursor-pointer"
						>
							<UserPen className="h-3.5 w-3.5 text-[var(--color-text-muted)] shrink-0" />
							<span className="font-medium">{t(item.name)}</span>
							{item.death_date_hijri && (
								<span className="text-xs text-[var(--color-text-muted)] ml-auto">
									d. {item.death_date_hijri}
								</span>
							)}
						</button>
					))}
					{showAddNew && (
						<button
							type="button"
							onClick={handleAddNew}
							className="w-full text-left px-3 py-2.5 text-sm text-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 transition-colors flex items-center gap-2 border-t border-[var(--color-border)] cursor-pointer"
						>
							<Plus className="h-3.5 w-3.5" />
							<span className="font-medium">Add Author</span>
						</button>
					)}
				</div>
			)}
		</div>
	);
};

// ─── Custom Dropdown ────────────────────────────────────────────────────────

interface DropdownOption {
	value: string;
	label: string;
	icon?: string;
}

interface CustomDropdownProps {
	label: string;
	options: DropdownOption[];
	value: string;
	onChange: (val: string) => void;
	placeholder?: string;
	required?: boolean;
	name?: string;
	icon?: React.ReactNode;
}

const CustomDropdown = ({
	label,
	options,
	value,
	onChange,
	placeholder = "Select…",
	required,
	name,
	icon,
}: CustomDropdownProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const wrapperRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
				setIsOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const selected = options.find((o) => o.value === value);

	return (
		<div ref={wrapperRef} className="relative">
			<label className="text-sm font-semibold block mb-1.5">
				{icon && <span className="inline-flex mr-1 -mt-0.5 align-middle">{icon}</span>}
				{label} {required && <span className="text-red-400">*</span>}
			</label>
			{/* Hidden native input for form submission */}
			{name && <input type="hidden" name={name} value={value} />}
			<button
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				className={`w-full flex items-center justify-between rounded-lg border px-3 py-2.5 text-sm transition-all cursor-pointer ${
					isOpen
						? "border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]"
						: "border-[var(--color-border)] hover:border-[var(--color-primary)]/50"
				}`}
			>
				<span className={selected ? "font-medium" : "text-[var(--color-text-muted)]"}>
					{selected ? (
						<span className="flex items-center gap-2">
							{selected.icon && <span>{selected.icon}</span>}
							{selected.label}
						</span>
					) : (
						placeholder
					)}
				</span>
				<ChevronDown
					className={`h-4 w-4 text-[var(--color-text-muted)] transition-transform ${
						isOpen ? "rotate-180" : ""
					}`}
				/>
			</button>
			{isOpen && (
				<div className="absolute z-30 w-full mt-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg max-h-56 overflow-y-auto">
					{options.map((opt) => (
						<button
							key={opt.value}
							type="button"
							onClick={() => {
								onChange(opt.value);
								setIsOpen(false);
							}}
							className={`w-full text-left px-3 py-2.5 text-sm flex items-center gap-2 transition-colors cursor-pointer ${
								value === opt.value
									? "bg-[var(--color-primary)]/5 text-[var(--color-primary)]"
									: "hover:bg-[var(--color-border)]"
							}`}
						>
							{opt.icon && <span>{opt.icon}</span>}
							<span className="font-medium flex-1">{opt.label}</span>
							{value === opt.value && (
								<Check className="h-4 w-4 text-[var(--color-primary)] shrink-0" />
							)}
						</button>
					))}
				</div>
			)}
		</div>
	);
};

// ─── Searchable Category ────────────────────────────────────────────────────

interface SearchableCategoryProps {
	label: string;
	categories: { id: string; name: string; description?: string }[];
	value: string;
	onChange: (val: string) => void;
	placeholder?: string;
	required?: boolean;
	name?: string;
}

const SearchableCategory = ({
	label,
	categories,
	value,
	onChange,
	placeholder = "Search category…",
	required,
	name,
}: SearchableCategoryProps) => {
	const [query, setQuery] = useState("");
	const [isOpen, setIsOpen] = useState(false);
	const wrapperRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
				setIsOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const filtered = categories.filter(
		(cat) => cat.name.toLowerCase().includes(query.toLowerCase())
	);

	const selected = categories.find((c) => c.id === value);

	const handleClear = () => {
		onChange("");
		setQuery("");
		setIsOpen(true);
		setTimeout(() => inputRef.current?.focus(), 0);
	};

	return (
		<div ref={wrapperRef} className="relative">
			<label className="text-sm font-semibold block mb-1.5">
				{label} {required && !selected && <span className="text-red-400">*</span>}
			</label>
			{name && <input type="hidden" name={name} value={value} />}

			{selected ? (
				<button
					type="button"
					onClick={handleClear}
					className="w-full flex items-center gap-2 rounded-lg border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/5 px-3 py-2.5 text-left cursor-pointer hover:bg-[var(--color-primary)]/10 transition-colors"
				>
					<Tag className="h-4 w-4 text-[var(--color-primary)] shrink-0" />
					<span className="text-sm font-medium">{selected.name}</span>
				</button>
			) : (
				<>
					<div className="relative">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
						<input
							ref={inputRef}
							type="text"
							value={query}
							onChange={(e) => {
								setQuery(e.target.value);
								setIsOpen(true);
							}}
							onFocus={() => setIsOpen(true)}
							placeholder={placeholder}
							className="w-full rounded-lg border border-[var(--color-border)] pl-9 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
						/>
					</div>
					{isOpen && (
						<div className="absolute z-30 w-full mt-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg max-h-56 overflow-y-auto">
							{filtered.length === 0 ? (
								<div className="px-3 py-4 text-sm text-[var(--color-text-muted)] text-center">
									No categories found
								</div>
							) : (
								filtered.map((cat) => (
									<button
										key={cat.id}
										type="button"
										onClick={() => {
											onChange(cat.id);
											setQuery("");
											setIsOpen(false);
										}}
										className="w-full text-left px-3 py-2.5 text-sm hover:bg-[var(--color-border)] transition-colors flex items-center gap-2 cursor-pointer"
									>
										<Tag className="h-3.5 w-3.5 text-[var(--color-text-muted)] shrink-0" />
										<div className="flex-1 min-w-0">
											<span className="font-medium">{cat.name}</span>
											{cat.description && (
												<span className="text-xs text-[var(--color-text-muted)] ml-2">
													— {cat.description}
												</span>
											)}
										</div>
									</button>
								))
							)}
						</div>
					)}
				</>
			)}
		</div>
	);
};

// ─── Tag Input ──────────────────────────────────────────────────────────────

interface TagInputProps {
	tags: { id?: string; name: string }[];
	onChange: (tags: { id?: string; name: string }[]) => void;
}

const TagInput = ({ tags, onChange }: TagInputProps) => {
	const [query, setQuery] = useState("");
	const [suggestions, setSuggestions] = useState<any[]>([]);
	const [isOpen, setIsOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const debouncedQuery = useDebounce(query, 300);
	const inputRef = useRef<HTMLInputElement>(null);
	const wrapperRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const fetchSuggestions = async () => {
			if (!debouncedQuery.trim()) {
				setSuggestions([]);
				return;
			}
			setLoading(true);
			try {
				const res = await fetch(`/api/admin/tags?q=${encodeURIComponent(debouncedQuery)}`);
				if (res.ok) {
					const data = await res.json();
					setSuggestions(data.data ?? []);
				}
			} catch {
				// ignore
			} finally {
				setLoading(false);
			}
		};
		if (isOpen) fetchSuggestions();
	}, [debouncedQuery, isOpen]);

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
				setIsOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const addTag = useCallback(
		async (name: string) => {
			const trimmed = name.trim();
			if (!trimmed) return;
			// Prevent duplicates
			if (tags.some((tg) => tg.name.toLowerCase() === trimmed.toLowerCase())) {
				setQuery("");
				return;
			}

			// Try to create/find tag via API
			try {
				const res = await fetch("/api/admin/tags", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ name: trimmed }),
				});
				if (res.ok) {
					const data = await res.json();
					onChange([...tags, { id: data.data.id, name: t(data.data.name) || trimmed }]);
				} else {
					onChange([...tags, { name: trimmed }]);
				}
			} catch {
				onChange([...tags, { name: trimmed }]);
			}
			setQuery("");
			setIsOpen(false);
		},
		[tags, onChange]
	);

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "," || e.key === "Enter") {
			e.preventDefault();
			addTag(query);
		}
		if (e.key === "Backspace" && !query && tags.length > 0) {
			onChange(tags.slice(0, -1));
		}
	};

	const removeTag = (index: number) => {
		onChange(tags.filter((_, i) => i !== index));
	};

	return (
		<div ref={wrapperRef} className="relative">
			<label className="text-sm font-semibold block mb-1.5">
				<Tag className="inline h-4 w-4 mr-1 -mt-0.5" />
				Tags
			</label>
			<div
				className="flex flex-wrap gap-1.5 rounded-lg border border-[var(--color-border)] px-3 py-2 min-h-[42px] focus-within:ring-2 focus-within:ring-[var(--color-primary)] cursor-text"
				onClick={() => inputRef.current?.focus()}
			>
				{tags.map((tag, i) => (
					<span
						key={i}
						className="inline-flex items-center gap-1 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-md px-2 py-0.5 text-xs font-medium"
					>
						{tag.name}
						<button
							type="button"
							onClick={() => removeTag(i)}
							className="hover:text-red-500 cursor-pointer"
						>
							<X className="h-3 w-3" />
						</button>
					</span>
				))}
				<input
					ref={inputRef}
					type="text"
					value={query}
					onChange={(e) => {
						const val = e.target.value;
						if (val.includes(",")) {
							const parts = val.split(",");
							for (const part of parts.slice(0, -1)) {
								addTag(part);
							}
							setQuery(parts[parts.length - 1]);
						} else {
							setQuery(val);
							setIsOpen(true);
						}
					}}
					onKeyDown={handleKeyDown}
					onFocus={() => query && setIsOpen(true)}
					placeholder={tags.length === 0 ? "Type and press comma to add tags…" : ""}
					className="flex-1 min-w-[120px] bg-transparent text-sm outline-none"
				/>
			</div>
			{isOpen && suggestions.length > 0 && (
				<div className="absolute z-30 w-full mt-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg max-h-40 overflow-y-auto">
					{suggestions.map((s) => (
						<button
							key={s.id}
							type="button"
							onClick={() => {
								if (!tags.some((tg) => tg.id === s.id)) {
									onChange([...tags, { id: s.id, name: t(s.name) }]);
								}
								setQuery("");
								setIsOpen(false);
							}}
							className="w-full text-left px-3 py-2 text-sm hover:bg-[var(--color-border)] transition-colors cursor-pointer"
						>
							<Tag className="inline h-3 w-3 mr-1.5 text-[var(--color-text-muted)]" />
							{t(s.name)}
						</button>
					))}
				</div>
			)}
			<p className="text-xs text-[var(--color-text-muted)] mt-1">
				Press <kbd className="px-1 py-0.5 rounded bg-[var(--color-border)] text-[10px]">comma</kbd> or <kbd className="px-1 py-0.5 rounded bg-[var(--color-border)] text-[10px]">Enter</kbd> to add a tag
			</p>
		</div>
	);
};

// ─── Translation Link Search ────────────────────────────────────────────────

interface TranslationLinkProps {
	value: { id: string; title: string; language_code: string } | null;
	onChange: (val: { id: string; title: string; language_code: string } | null) => void;
}

const LANG_LABELS: Record<string, string> = {
	ar: "🇸🇦 Arabic",
	en: "🇬🇧 English",
	bn: "🇧🇩 Bangla",
	ur: "🇵🇰 Urdu",
};

const TranslationLink = ({ value, onChange }: TranslationLinkProps) => {
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<any[]>([]);
	const [isOpen, setIsOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const debouncedQuery = useDebounce(query, 300);
	const wrapperRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const fetchResults = async () => {
			if (!debouncedQuery.trim()) {
				setResults([]);
				return;
			}
			setLoading(true);
			try {
				const res = await fetch(`/api/admin/books/search?q=${encodeURIComponent(debouncedQuery)}`);
				if (res.ok) {
					const data = await res.json();
					setResults(data.data ?? []);
				}
			} catch {
				// ignore
			} finally {
				setLoading(false);
			}
		};
		if (isOpen) fetchResults();
	}, [debouncedQuery, isOpen]);

	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
				setIsOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	if (value) {
		return (
			<div>
				<label className="text-sm font-semibold block mb-1.5">
					<Link2 className="inline h-4 w-4 mr-1 -mt-0.5" />
					Translation of (original book)
				</label>
				<div className="flex items-center gap-2 rounded-lg border border-blue-300/50 bg-blue-50/50 px-3 py-2.5">
					<BookOpen className="h-4 w-4 text-blue-500 shrink-0" />
					<div className="flex-1 min-w-0">
						<span className="text-sm font-medium block truncate">{value.title}</span>
						<span className="text-xs text-[var(--color-text-muted)]">
							{LANG_LABELS[value.language_code] || value.language_code.toUpperCase()}
						</span>
					</div>
					<button
						type="button"
						onClick={() => onChange(null)}
						className="p-0.5 rounded hover:bg-[var(--color-border)] transition-colors cursor-pointer"
					>
						<X className="h-3.5 w-3.5 text-[var(--color-text-muted)]" />
					</button>
				</div>
			</div>
		);
	}

	return (
		<div ref={wrapperRef} className="relative">
			<label className="text-sm font-semibold block mb-1.5">
				<Link2 className="inline h-4 w-4 mr-1 -mt-0.5" />
				Translation of (optional)
			</label>
			<p className="text-xs text-[var(--color-text-muted)] mb-2">
				If this book is a translation of another book, search and link it here.
			</p>
			<div className="relative">
				<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-muted)]" />
				<input
					type="text"
					value={query}
					onChange={(e) => {
						setQuery(e.target.value);
						setIsOpen(true);
					}}
					onFocus={() => query && setIsOpen(true)}
					placeholder="Search for the original book…"
					className="w-full rounded-lg border border-[var(--color-border)] pl-9 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
				/>
				{loading && (
					<Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-[var(--color-text-muted)]" />
				)}
			</div>
			{isOpen && results.length > 0 && (
				<div className="absolute z-30 w-full mt-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg max-h-56 overflow-y-auto">
					{results.map((book) => (
						<button
							key={book.id}
							type="button"
							onClick={() => {
								onChange({
									id: book.id,
									title: t(book.title),
									language_code: book.language_code,
								});
								setQuery("");
								setIsOpen(false);
							}}
							className="w-full text-left px-3 py-2.5 text-sm hover:bg-[var(--color-border)] transition-colors cursor-pointer"
						>
							<div className="flex items-center gap-2">
								<BookOpen className="h-3.5 w-3.5 text-[var(--color-text-muted)] shrink-0" />
								<span className="font-medium truncate">{t(book.title)}</span>
								<span className="ml-auto text-xs text-[var(--color-text-muted)] shrink-0">
									{LANG_LABELS[book.language_code] || book.language_code.toUpperCase()}
								</span>
							</div>
							{book.author && (
								<p className="text-xs text-[var(--color-text-muted)] ml-5.5 mt-0.5">
									by {t(book.author.name)}
								</p>
							)}
						</button>
					))}
				</div>
			)}
		</div>
	);
};

// ─── Section Wrapper ────────────────────────────────────────────────────────

const Section = ({
	icon: Icon,
	title,
	children,
}: {
	icon: any;
	title: string;
	children: React.ReactNode;
}) => (
	<section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
		<div className="flex items-center gap-2 px-5 py-3 bg-[var(--color-border)]/30 border-b border-[var(--color-border)] rounded-t-xl">
			<Icon className="h-4 w-4 text-[var(--color-primary)]" />
			<h3 className="text-sm font-semibold">{title}</h3>
		</div>
		<div className="p-5 space-y-4">{children}</div>
	</section>
);

// ─── Main Form ──────────────────────────────────────────────────────────────

interface UploadBookFormProps {
	dict: any;
	categories: any[];
	authors: any[];
}

export function UploadBookForm({ dict, categories }: UploadBookFormProps) {
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState("");
	const [pdfFileName, setPdfFileName] = useState("");
	const [coverPreview, setCoverPreview] = useState("");

	// Controlled state for searchable fields
	const [author, setAuthor] = useState<{ id: string; name: string } | null>(null);
	const [translator, setTranslator] = useState<{ id: string; name: string } | null>(null);
	const [tags, setTags] = useState<{ id?: string; name: string }[]>([]);
	const [translationOf, setTranslationOf] = useState<{
		id: string;
		title: string;
		language_code: string;
	} | null>(null);
	const [selectedLanguage, setSelectedLanguage] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("");

	const a = dict.admin;

	const isRtl = selectedLanguage === "ar" || selectedLanguage === "ur";
	const textDir = isRtl ? "rtl" : "ltr";

	const isMushaf = selectedCategory === "mushaf";
	const isTafseer = selectedCategory === "tafseer";
	const isTranslation = selectedCategory === "translation-of-the-quran";
	const noAuthorField = isMushaf || isTranslation;

	const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		setPdfFileName(file ? file.name : "");
	};

	const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			const url = URL.createObjectURL(file);
			setCoverPreview(url);
		} else {
			setCoverPreview("");
		}
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setIsSubmitting(true);
		setError("");

		if (!isMushaf && !author) {
			const label = isTranslation
				? "Please select a translator."
				: isTafseer
					? "Please select a mufassir."
					: "Please select an author.";
			setError(label);
			setIsSubmitting(false);
			return;
		}

		const formData = new FormData(e.currentTarget);
		if (isTranslation && author) {
			// For Translation of the Qur'an, the primary person is the translator
			formData.set("translator_id", author.id);
		} else if (isTafseer && author) {
			// For Tafseer, the primary person is the mufassir (stored as author)
			formData.set("author_id", author.id);
			if (translator) formData.set("translator_id", translator.id);
		} else if (!isMushaf && author) {
			formData.set("author_id", author.id);
			if (translator) formData.set("translator_id", translator.id);
		}
		formData.set("language_code", selectedLanguage);
		formData.set("category_id", selectedCategory);
		if (translationOf) formData.set("translation_of_id", translationOf.id);

		// Send tags as JSON
		const tagIds = tags.filter((tg) => tg.id).map((tg) => tg.id);
		formData.set("tag_ids", JSON.stringify(tagIds));

		try {
			const res = await fetch("/api/admin/books", {
				method: "POST",
				body: formData,
			});

			if (!res.ok) {
				const data = await res.json();
				throw new Error(data.error || "Upload failed");
			}

			router.push(localePath("/admin/books"));
			router.refresh();
		} catch (err: any) {
			setError(err.message);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
			{error && (
				<div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700 flex items-center gap-2">
					<X className="h-4 w-4 shrink-0" />
					{error}
				</div>
			)}

			{/* ── Section 1: Language Selection ───────────────────────── */}
			<Section icon={Languages} title="Language">
				<CustomDropdown
					label="Select the language of this book"
					name="language_code"
					icon={<Languages className="h-4 w-4" />}
					options={[
						{ value: "ar", label: "Arabic", icon: "🇸🇦" },
						{ value: "en", label: "English", icon: "🇬🇧" },
						{ value: "bn", label: "Bangla", icon: "🇧🇩" },
						{ value: "ur", label: "Urdu", icon: "🇵🇰" },
					]}
					value={selectedLanguage}
					onChange={setSelectedLanguage}
					placeholder="Choose a language to get started…"
					required
				/>
			</Section>

			{/* ── Everything below collapses until language is picked ── */}
			<div
				className={`space-y-6 transition-all duration-500 ease-in-out ${
					selectedLanguage
						? "opacity-100 translate-y-0"
						: "opacity-0 translate-y-4 pointer-events-none max-h-0 overflow-hidden"
				}`}
			>
				{/* ── Section 2: Book Title ───────────────────────────── */}
				<Section icon={BookOpen} title="Book Title">
					<div>
						<label className="text-sm font-semibold block mb-1.5">
							Title <span className="text-red-400">*</span>
						</label>
						<input
							name="title"
							type="text"
							dir={textDir}
							required={!!selectedLanguage}
							className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2.5 text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
							placeholder={`Enter the book title in ${
								LANG_LABELS[selectedLanguage]?.split(" ").pop() ?? "…"
							}…`}
						/>
					</div>
				</Section>

				{/* ── Section 3: Classification ───────────────────────── */}
				<Section icon={Tag} title="Classification">
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<SearchableCategory
							label="Category"
							name="category_id"
							categories={categories}
							value={selectedCategory}
							onChange={(val) => {
								setSelectedCategory(val);
								// Clear author/translator when switching to categories without author
								if (val === "mushaf" || val === "translation-of-the-quran") {
									setAuthor(null);
									setTranslator(null);
								}
							}}
							placeholder="Search category…"
							required
						/>
						<TagInput tags={tags} onChange={setTags} />
					</div>
				</Section>

				{/* ── Section 4: Author & Translator (hidden for Mushaf) ── */}
				{!isMushaf && (
					<Section
						icon={UserPen}
						title={
							isTranslation
								? "Translator"
								: isTafseer
									? "Mufassir & Translator"
									: "Author & Translator"
						}
					>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<SearchablePerson
								label={
									isTranslation
										? "Translator"
										: isTafseer
											? "Mufassir"
											: "Author"
								}
								placeholder={
									isTranslation
										? "Search translator by name…"
										: isTafseer
											? "Search mufassir by name…"
											: "Search author by name…"
								}
								apiUrl="/api/admin/authors/search"
								value={author}
								onChange={setAuthor}
								required
								showAddNew
							/>
							{!isTranslation && (
								<SearchablePerson
									label="Translator (optional)"
									placeholder="Search translator…"
									apiUrl="/api/admin/authors/search"
									value={translator}
									onChange={setTranslator}
									showAddNew
								/>
							)}
						</div>
					</Section>
				)}

				{/* ── Section 5: Translation Link ────────────────────── */}
				<Section icon={Link2} title="Translation Link">
					<TranslationLink value={translationOf} onChange={setTranslationOf} />
				</Section>

				{/* ── Section 6: Description ──────────────────────────── */}
				<Section icon={FileText} title="Description">
					<textarea
						name="description_en"
						dir={textDir}
						rows={5}
						className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2.5 text-sm focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none resize-y"
						placeholder="Write a detailed description of the book…"
					/>
				</Section>

				{/* ── Section 7: Files ────────────────────────────────── */}
				<Section icon={Upload} title="Files">
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
						{/* PDF */}
						<div>
							<label className="text-sm font-semibold block mb-1.5">
								PDF File <span className="text-red-400">*</span>
							</label>
							<label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[var(--color-border)] p-6 hover:border-[var(--color-primary)] transition-colors cursor-pointer group">
								<FileText className="h-8 w-8 text-[var(--color-text-muted)] mb-2 group-hover:text-[var(--color-primary)] transition-colors" />
								{pdfFileName ? (
									<span className="text-sm font-medium text-[var(--color-primary)] text-center truncate max-w-full">
										{pdfFileName}
									</span>
								) : (
									<span className="text-sm text-[var(--color-text-muted)]">
										Click to select PDF
									</span>
								)}
								<span className="text-xs text-[var(--color-text-muted)] mt-1">
									Max 50MB
								</span>
								<input
									type="file"
									name="pdf"
									accept=".pdf"
									required={!!selectedLanguage}
									onChange={handlePdfChange}
									className="hidden"
								/>
							</label>
						</div>

						{/* Cover */}
						<div>
							<label className="text-sm font-semibold block mb-1.5">
								Cover Image (optional)
							</label>
							<label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[var(--color-border)] p-6 hover:border-[var(--color-primary)] transition-colors cursor-pointer group overflow-hidden relative min-h-[140px]">
								{coverPreview ? (
									<img
										src={coverPreview}
										alt="Cover preview"
										className="absolute inset-0 w-full h-full object-cover opacity-80"
									/>
								) : (
									<>
										<ImageIcon className="h-8 w-8 text-[var(--color-text-muted)] mb-2 group-hover:text-[var(--color-primary)] transition-colors" />
										<span className="text-sm text-[var(--color-text-muted)]">
											Click to select image
										</span>
									</>
								)}
								<input
									type="file"
									name="cover"
									accept="image/*"
									onChange={handleCoverChange}
									className="hidden"
								/>
							</label>
						</div>
					</div>
				</Section>

				{/* ── Section 8: Options ──────────────────────────────── */}
				<Section icon={Settings2} title="Options">
					<div className="flex flex-wrap gap-6">
						<label className="flex items-center gap-2.5 text-sm cursor-pointer">
							<input
								type="checkbox"
								name="is_downloadable"
								defaultChecked
								className="rounded border-[var(--color-border)] h-4 w-4"
							/>
							Allow downloads
						</label>
						<label className="flex items-center gap-2.5 text-sm cursor-pointer">
							<input
								type="checkbox"
								name="is_featured"
								className="rounded border-[var(--color-border)] h-4 w-4"
							/>
							Featured book
						</label>
					</div>
				</Section>

				{/* ── Submit ──────────────────────────────────────────── */}
				<div className="flex items-center gap-4 pt-2">
					<button
						type="submit"
						disabled={isSubmitting}
						className="flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-8 py-3 text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
					>
						{isSubmitting ? (
							<Loader2 className="h-4 w-4 animate-spin" />
						) : (
							<Upload className="h-4 w-4" />
						)}
						{a.uploadBook}
					</button>
					<button
						type="button"
						onClick={() => router.back()}
						className="px-6 py-3 text-sm font-medium text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors cursor-pointer"
					>
						Cancel
					</button>
				</div>
			</div>
		</form>
	);
}
