import type { Metadata } from "next";
import "./globals.css";
import ClientWrapper from "@/components/ClientWrapper";

export const metadata: Metadata = {
  title: "PhantomScrape",
  description: "AI-powered web scraper and data cleaner",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#0a0a0a] text-white min-h-screen">
        <ClientWrapper>{children}</ClientWrapper>
      </body>
    </html>
  );
}