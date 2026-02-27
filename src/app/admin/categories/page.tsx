import { getDictionary } from "@/dictionaries";
import categoriesJson from "@/lib/categories.json";
import { ManageCategoriesClient } from "@/components/admin/ManageCategoriesClient";

export default async function ManageCategoriesPage() {
	const dict = await getDictionary();

	return (
		<ManageCategoriesClient
			dict={dict}
			initialCategories={categoriesJson}
		/>
	);
}
