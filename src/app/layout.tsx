import type { Metadata } from "next";
import { Toaster } from "sonner";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { getDictionary } from "@/dictionaries";
import "./globals.css";

export const metadata: Metadata = {
	title: "Islamic Library",
	description:
		"A comprehensive online Islamic library with thousands of authentic books from classical and contemporary scholars.",
};

export default async function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const dict = await getDictionary();

	return (
		<html lang="en" dir="ltr" suppressHydrationWarning>
			<head>
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link
					rel="preconnect"
					href="https://fonts.gstatic.com"
					crossOrigin="anonymous"
				/>
				<link
					href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Amiri:wght@400;700&family=Noto+Naskh+Arabic:wght@400;600;700&display=swap"
					rel="stylesheet"
				/>
			</head>
			<body className="min-h-screen flex flex-col antialiased">
				<Toaster position="top-center" richColors closeButton />
				<Header dict={dict} />
				<main className="flex-1">{children}</main>
				<Footer dict={dict} />
			</body>
		</html>
	);
}
