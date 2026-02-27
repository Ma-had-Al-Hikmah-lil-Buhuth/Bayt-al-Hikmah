import { redirect } from "next/navigation";
import { getDictionary } from "@/dictionaries";
import { getCurrentUser } from "@/lib/auth";
import { localePath } from "@/lib/utils";
import { AdminSidebarClient } from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const dict = await getDictionary();
	const a = dict.admin;

	// Auth guard — JWT-based
	const user = await getCurrentUser();

	if (!user) {
		redirect(localePath("/auth/login"));
	}

	if (!user.isAdmin) {
		redirect(localePath("/"));
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
		<>
			<style>{`footer { display: none !important; }`}</style>
			<div className="flex min-h-screen">
				<AdminSidebarClient
					navItems={navItems}
					backLabel={dict.common.backToHome || "Back to Site"}
					backHref={localePath("/")}
				/>
				<div className="flex-1 min-w-0 bg-[var(--color-bg)]">
					{children}
				</div>
			</div>
		</>
	);
}
