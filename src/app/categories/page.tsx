import Link from "next/link";
import { BookOpen } from "lucide-react";
import { getDictionary } from "@/dictionaries";
import categoriesJson from "@/lib/categories.json";
import { localePath } from "@/lib/utils";

export default async function CategoriesPage() {
	const dict = await getDictionary();

	return (
		<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
			<h1 className="text-3xl font-bold mb-2">
				{dict.common.categories}
			</h1>
			<p className="text-[var(--color-text-muted)] mb-8">
				{dict.home.browseCategories}
			</p>

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
				{categoriesJson.map((cat: any) => (
					<Link
						key={cat.slug}
						href={localePath(`/books?category=${cat.slug}`)}
						className="category-card group rounded-2xl border border-[var(--color-border)] p-6 hover:shadow-lg transition-all"
					>
						<div className="flex items-start gap-4">
							<div className="rounded-xl bg-[var(--color-primary)]/10 p-3">
								<BookOpen className="h-6 w-6 text-[var(--color-primary)]" />
							</div>
							<div className="flex-1">
								<h2 className="text-lg font-semibold group-hover:text-[var(--color-primary)] transition-colors">
									{cat.name}
								</h2>
								<p className="text-sm text-[var(--color-text-muted)] mt-1">
									{cat.description}
								</p>
							</div>
						</div>
					</Link>
				))}
			</div>
		</div>
	);
}
