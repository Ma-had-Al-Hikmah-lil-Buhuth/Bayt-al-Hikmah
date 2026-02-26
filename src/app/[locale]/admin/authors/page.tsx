import { getDictionary } from "@/dictionaries";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ManageAuthorsClient } from "@/components/admin/ManageAuthorsClient";
import type { Locale } from "@/types/database";

export default async function ManageAuthorsPage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale: rawLocale } = await params;
	const locale = rawLocale as Locale;
	const dict = await getDictionary(locale);

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
			locale={locale}
			dict={dict}
			initialAuthors={authors}
		/>
	);
}
