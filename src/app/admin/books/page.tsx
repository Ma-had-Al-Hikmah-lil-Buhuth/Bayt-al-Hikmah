import { getDictionary } from "@/dictionaries";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ManageBooksClient } from "@/components/admin/ManageBooksClient";

export default async function ManageBooksPage() {
	const dict = await getDictionary();

	let books: any[] = [];
	let authors: any[] = [];
	let categories: any[] = [];

	try {
		const supabase = await createServerSupabaseClient();
		const [booksRes, authorsRes, catsRes] = await Promise.all([
			supabase
				.from("books")
				.select("*, author:authors(*), category:categories(*)")
				.order("created_at", { ascending: false }),
			supabase.from("authors").select("*").order("name"),
			supabase.from("categories").select("*").order("sort_order"),
		]);
		books = booksRes.data ?? [];
		authors = authorsRes.data ?? [];
		categories = catsRes.data ?? [];
	} catch {
		// Supabase not configured
	}

	return (
		<ManageBooksClient
			dict={dict}
			initialBooks={books}
			authors={authors}
			categories={categories}
		/>
	);
}
