import { getDictionary } from "@/dictionaries";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ManageCategoriesClient } from "@/components/admin/ManageCategoriesClient";
import type { Locale } from "@/types/database";

export default async function ManageCategoriesPage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale: rawLocale } = await params;
	const locale = rawLocale as Locale;
	const dict = await getDictionary(locale);

	let categories: any[] = [];

	try {
		const supabase = await createServerSupabaseClient();
		const { data } = await supabase
			.from("categories")
			.select("*")
			.order("sort_order");
		categories = data ?? [];
	} catch {
		// Supabase not configured
	}

	return (
		<ManageCategoriesClient
			locale={locale}
			dict={dict}
			initialCategories={categories}
		/>
	);
}
