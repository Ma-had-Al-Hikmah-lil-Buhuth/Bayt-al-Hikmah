import { getDictionary } from "@/dictionaries";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ManageCategoriesClient } from "@/components/admin/ManageCategoriesClient";

export default async function ManageCategoriesPage() {
	const dict = await getDictionary();

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
			dict={dict}
			initialCategories={categories}
		/>
	);
}
