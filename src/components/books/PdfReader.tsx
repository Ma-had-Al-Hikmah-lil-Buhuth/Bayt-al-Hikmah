"use client";

import { useState, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import {
	ChevronLeft,
	ChevronRight,
	Maximize2,
	Minimize2,
	Bookmark,
	Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

/* eslint-disable @typescript-eslint/no-explicit-any */
interface PdfReaderProps {
	pdfUrl: string;
	bookId: number | string;
	dict: any;
}

export function PdfReader({ pdfUrl, bookId, dict }: PdfReaderProps) {
	const [numPages, setNumPages] = useState(0);
	const [pageNumber, setPageNumber] = useState(1);
	const [isFullScreen, setIsFullScreen] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [goToInput, setGoToInput] = useState("");
	const b = dict.book;

	const onDocumentLoadSuccess = useCallback(
		({ numPages: total }: { numPages: number }) => {
			setNumPages(total);
			setIsLoading(false);
		},
		[]
	);

	function changePage(offset: number) {
		setPageNumber((prev) => Math.max(1, Math.min(prev + offset, numPages)));
	}

	function goToPage() {
		const p = parseInt(goToInput, 10);
		if (!isNaN(p) && p >= 1 && p <= numPages) {
			setPageNumber(p);
			setGoToInput("");
		}
	}

	async function handleBookmark() {
		try {
			const res = await fetch("/api/bookmarks", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					book_id: bookId,
					page_number: pageNumber,
				}),
			});
			if (res.ok) {
				alert(b.bookmarkAdded);
			}
		} catch {
			// silently fail if not logged in
		}
	}

	if (!pdfUrl) {
		return (
			<div className="rounded-xl border border-[var(--color-border)] p-12 text-center text-[var(--color-text-muted)]">
				No PDF available for this book.
			</div>
		);
	}

	return (
		<div
			className={cn(
				"rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden",
				isFullScreen && "pdf-fullscreen"
			)}
		>
			{/* ── Toolbar ───────────────────────────────────────────── */}
			<div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-2 bg-[var(--color-bg)]">
				<div className="flex items-center gap-2">
					{/* Prev */}
					<button
						onClick={() => changePage(-1)}
						disabled={pageNumber <= 1}
						className="p-2 rounded-lg hover:bg-[var(--color-border)] disabled:opacity-30 transition-colors"
						aria-label={b.previousPage}
					>
						<ChevronLeft className="h-4 w-4 flip-rtl" />
					</button>

					{/* Page info */}
					<span className="text-sm">
						{b.page} {pageNumber} {b.of} {numPages || "…"}
					</span>

					{/* Next */}
					<button
						onClick={() => changePage(1)}
						disabled={pageNumber >= numPages}
						className="p-2 rounded-lg hover:bg-[var(--color-border)] disabled:opacity-30 transition-colors"
						aria-label={b.nextPage}
					>
						<ChevronRight className="h-4 w-4 flip-rtl" />
					</button>
				</div>

				<div className="flex items-center gap-2">
					{/* Go to page */}
					<form
						onSubmit={(e) => {
							e.preventDefault();
							goToPage();
						}}
						className="flex items-center gap-1"
					>
						<input
							type="number"
							min={1}
							max={numPages}
							value={goToInput}
							onChange={(e) => setGoToInput(e.target.value)}
							placeholder={b.goToPage}
							className="w-20 rounded-md border border-[var(--color-border)] px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
						/>
					</form>

					{/* Bookmark */}
					<button
						onClick={handleBookmark}
						className="p-2 rounded-lg hover:bg-[var(--color-border)] transition-colors"
						aria-label={b.bookmark}
						title={b.bookmark}
					>
						<Bookmark className="h-4 w-4" />
					</button>

					{/* Fullscreen */}
					<button
						onClick={() => setIsFullScreen(!isFullScreen)}
						className="p-2 rounded-lg hover:bg-[var(--color-border)] transition-colors"
						aria-label={
							isFullScreen ? b.exitFullScreen : b.fullScreen
						}
					>
						{isFullScreen ? (
							<Minimize2 className="h-4 w-4" />
						) : (
							<Maximize2 className="h-4 w-4" />
						)}
					</button>
				</div>
			</div>

			{/* ── PDF Canvas ────────────────────────────────────────── */}
			<div className="flex justify-center py-4 min-h-[500px] bg-neutral-100 dark:bg-neutral-900 overflow-auto">
				{isLoading && (
					<div className="flex items-center justify-center gap-2 text-[var(--color-text-muted)]">
						<Loader2 className="h-5 w-5 animate-spin" />
						{dict.common.loading}
					</div>
				)}
				<Document
					file={pdfUrl}
					onLoadSuccess={onDocumentLoadSuccess}
					loading=""
					className="max-w-full"
				>
					<Page
						pageNumber={pageNumber}
						width={isFullScreen ? 900 : 700}
						renderTextLayer
						renderAnnotationLayer
					/>
				</Document>
			</div>
		</div>
	);
}
