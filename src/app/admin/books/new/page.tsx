import { getDictionary } from "@/dictionaries";
import { UploadBookForm } from "@/components/admin/UploadBookForm";
import categories from "@/lib/categories.json";

export default async function NewBookPage() {
	const dict = await getDictionary();

	return (
		<div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
			<h1 className="text-3xl font-bold mb-8">{dict.admin.uploadBook}</h1>
			<UploadBookForm
				dict={dict}
				categories={categories}
			/>
		</div>
	);
}
