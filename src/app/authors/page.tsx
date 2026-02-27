import Link from "next/link";
import { User, Calendar, BookOpen } from "lucide-react";
import { getDictionary } from "@/dictionaries";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { localePath, t } from "@/lib/utils";
import { sampleAuthors, sampleBooks } from "@/lib/sampleData";

export default async function AuthorsPage() {
	const dict = await getDictionary();

	let authors: any[] = [];

	try {
		const supabase = await createServerSupabaseClient();
		const { data } = await supabase
			.from("authors")
			.select("*, books:books(count)")
			.order("era", { ascending: true });
		authors = data ?? [];
	} catch {
		// Fallback
	}

	// Use sample data when Supabase returns empty / is not configured
	if (authors.length === 0) {
		authors = sampleAuthors.map((a) => ({
			...a,
			books: [
				{
					count: sampleBooks.filter((b) => b.author_id === a.id)
						.length,
				},
			],
		}));
	}

	// Group by era
	const grouped: Record<string, any[]> = {};
	authors.forEach((a) => {
		const era = a.era ?? "Other";
		if (!grouped[era]) grouped[era] = [];
		grouped[era].push(a);
	});

	const eraOrder = ["Classical", "Medieval", "Contemporary", "Other"];

	return (
		<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
			<h1 className="text-3xl font-bold mb-2">{dict.common.authors}</h1>
			<p className="text-[var(--color-text-muted)] mb-8">
				{dict.home.popularAuthors}
			</p>

			{eraOrder.map((era) => {
				const group = grouped[era];
				if (!group || group.length === 0) return null;
				return (
					<div key={era} className="mb-12">
						<h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
							<Calendar className="h-5 w-5 text-[var(--color-primary)]" />
							{era}
						</h2>
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
							{group.map((author: any) => (
								<Link
									key={author.id}
									href={localePath(
										`/authors/${author.id}`
									)}
									className="group rounded-2xl border border-[var(--color-border)] p-6 hover:shadow-lg hover:border-[var(--color-primary)] transition-all"
								>
									<div className="flex items-start gap-4">
										<div className="rounded-full bg-[var(--color-primary)]/10 p-3">
											<User className="h-6 w-6 text-[var(--color-primary)]" />
										</div>
										<div className="flex-1 min-w-0">
											<h3 className="font-semibold text-lg group-hover:text-[var(--color-primary)] transition-colors">
												{t(author.name)}
											</h3>
											<p className="text-xs text-[var(--color-text-muted)] mt-1">
												{author.death_date_hijri &&
													`d. ${author.death_date_hijri}`}
											</p>
											<p className="text-sm text-[var(--color-text-muted)] mt-2 line-clamp-2">
												{t(author.bio)}
											</p>
											{author.books && (
												<span className="text-xs text-[var(--color-text-muted)] mt-2 inline-flex items-center gap-1">
													<BookOpen className="h-3 w-3" />
													{author.books[0]?.count ??
														0}{" "}
													books
												</span>
											)}
										</div>
									</div>
								</Link>
							))}
						</div>
					</div>
				);
			})}
		</div>
	);
}
