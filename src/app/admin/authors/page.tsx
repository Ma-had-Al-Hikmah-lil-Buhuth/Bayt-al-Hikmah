import { getDictionary } from "@/dictionaries";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { ManageAuthorsClient } from "@/components/admin/ManageAuthorsClient";

/* eslint-disable @typescript-eslint/no-explicit-any */

export default async function ManageAuthorsPage() {
	const dict = await getDictionary();

	let authors: any[] = [];

	try {
		const supabase = await createAdminSupabaseClient();
		const { data } = await supabase
			.from("authors")
			.select("id, name, bio, birth_year, death_year, created_at")
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
