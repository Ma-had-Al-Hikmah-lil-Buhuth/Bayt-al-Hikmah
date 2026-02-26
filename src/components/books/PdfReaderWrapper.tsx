"use client";

import dynamic from "next/dynamic";
import type { Locale } from "@/types/database";

const PdfReader = dynamic(
	() => import("@/components/books/PdfReader").then((m) => m.PdfReader),
	{
		ssr: false,
		loading: () => (
			<div className="text-center py-12">Loading PDF reader...</div>
		),
	}
);

/* eslint-disable @typescript-eslint/no-explicit-any */
interface PdfReaderWrapperProps {
	pdfUrl: string;
	bookId: string;
	locale: Locale;
	dict: any;
}

export function PdfReaderWrapper({
	pdfUrl,
	bookId,
	locale,
	dict,
}: PdfReaderWrapperProps) {
	return (
		<PdfReader
			pdfUrl={pdfUrl}
			bookId={bookId}
			locale={locale}
			dict={dict}
		/>
	);
}
