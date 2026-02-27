import { getDictionary } from "@/dictionaries";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ManageUsersClient } from "@/components/admin/ManageUsersClient";

export default async function ManageUsersPage() {
	const dict = await getDictionary();

	let users: any[] = [];

	try {
		const supabase = await createServerSupabaseClient();
		const { data } = await supabase
			.from("profiles")
			.select("*")
			.order("created_at", { ascending: false });
		users = data ?? [];
	} catch {
		// Supabase not configured
	}

	return (
		<ManageUsersClient dict={dict} initialUsers={users} />
	);
}
