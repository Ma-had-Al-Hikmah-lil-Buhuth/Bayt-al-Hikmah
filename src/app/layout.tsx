import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export const metadata: Metadata = {
	title: "Islamic Library",
	description:
		"A comprehensive online Islamic library with thousands of authentic books from classical and contemporary scholars.",
};

/**
 * Root layout — renders <html> and <body> as required by Next.js 16+.
 * Reads locale / direction from middleware-set headers.
 */
export default async function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const hdrs = await headers();
	const locale = hdrs.get("x-locale") || "en";
	const dir = hdrs.get("x-direction") || "ltr";

	return (
		<html lang={locale} dir={dir} suppressHydrationWarning>
			<head>
				{/* Google Fonts: Latin + Arabic */}
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
				{children}
			</body>
		</html>
	);
}
