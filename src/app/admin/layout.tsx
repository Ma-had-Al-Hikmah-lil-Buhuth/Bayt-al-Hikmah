import { redirect } from "next/navigation";
import { getDictionary } from "@/dictionaries";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { localePath } from "@/lib/utils";
import { AdminSidebarClient } from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const dict = await getDictionary();
	const a = dict.admin;

	// Auth guard
	try {
		const supabase = await createServerSupabaseClient();
		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			redirect(localePath("/auth/login"));
		}

		const { data: profile } = await supabase
			.from("profiles")
			.select("role")
			.eq("id", user.id)
			.single();

		if (profile?.role !== "admin") {
			redirect(localePath("/"));
		}
	} catch {
		// Allow render for demo/dev
	}

	const navItems = [
		{
			href: localePath("/admin"),
			label: a.dashboard,
			icon: "LayoutDashboard",
		},
		{
			href: localePath("/admin/books"),
			label: a.manageBooks,
			icon: "BookOpen",
		},
		{
			href: localePath("/admin/books/new"),
			label: a.uploadBook,
			icon: "Upload",
		},
		{
			href: localePath("/admin/authors"),
			label: a.manageAuthors,
			icon: "Users",
		},
		{
			href: localePath("/admin/categories"),
			label: a.manageCategories,
			icon: "FolderOpen",
		},
		{
			href: localePath("/admin/users"),
			label: a.manageUsers || "Manage Users",
			icon: "UserCog",
		},
	];

	return (
		<div className="flex min-h-[calc(100vh-4rem)]">
			<AdminSidebarClient
				navItems={navItems}
				backLabel={dict.common.backToHome || "Back to Site"}
				backHref={localePath("/")}
			/>
			<div className="flex-1 min-w-0 bg-[var(--color-bg)]">
				{children}
			</div>
		</div>
	);
}
