import { getDictionary } from "@/dictionaries";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ManageAuthorsClient } from "@/components/admin/ManageAuthorsClient";

export default async function ManageAuthorsPage() {
	const dict = await getDictionary();

	let authors: any[] = [];

	try {
		const supabase = await createServerSupabaseClient();
		const { data } = await supabase
			.from("authors")
			.select("*")
			.order("created_at", { ascending: false });
		authors = data ?? [];
	} catch {
		// Supabase not configured
	}

	return (
		<ManageAuthorsClient
			dict={dict}
			initialAuthors={authors}
		/>
	);
}
