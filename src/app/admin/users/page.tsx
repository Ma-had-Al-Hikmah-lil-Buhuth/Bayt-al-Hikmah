import { getDictionary } from "@/dictionaries";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { ManageUsersClient } from "@/components/admin/ManageUsersClient";

/* eslint-disable @typescript-eslint/no-explicit-any */

export default async function ManageUsersPage() {
	const dict = await getDictionary();

	let users: any[] = [];

	try {
		const supabase = await createAdminSupabaseClient();
		const { data } = await supabase
			.from("users")
			.select("id, email, name, is_admin, created_at")
			.order("created_at", { ascending: false });
		users = data ?? [];
	} catch {
		// Supabase not configured
	}

	return (
		<ManageUsersClient dict={dict} initialUsers={users} />
	);
}
