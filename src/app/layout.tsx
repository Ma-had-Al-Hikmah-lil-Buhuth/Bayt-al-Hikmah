import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Islamic Library",
  description:
    "A comprehensive online Islamic library with thousands of authentic books from classical and contemporary scholars.",
};

/**
 * Root layout — does NOT render <html>/<body> itself.
 * Those are rendered by the [locale] layout so we can set `dir` and `lang`.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
