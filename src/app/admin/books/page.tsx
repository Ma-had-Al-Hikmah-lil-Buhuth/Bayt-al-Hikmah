import { getDictionary } from "@/dictionaries";
import categoriesJson from "@/lib/categories.json";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ManageBooksClient } from "@/components/admin/ManageBooksClient";

/* eslint-disable @typescript-eslint/no-explicit-any */

export default async function ManageBooksPage() {
	const dict = await getDictionary();

	let books: any[] = [];
	let authors: any[] = [];

	try {
		const supabase = await createServerSupabaseClient();
		const [booksRes, authorsRes] = await Promise.all([
			supabase
				.from("books")
				.select("*, author:authors(*)")
				.order("created_at", { ascending: false }),
			supabase.from("authors").select("*").order("name"),
		]);
		books = booksRes.data ?? [];
		authors = authorsRes.data ?? [];
	} catch {
		// Supabase not configured
	}

	return (
		<ManageBooksClient
			dict={dict}
			initialBooks={books}
			authors={authors}
			categories={categoriesJson}
		/>
	);
}
