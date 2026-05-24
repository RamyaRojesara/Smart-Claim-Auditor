import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Smart Claim Auditor",
  description: "AI-powered claim auditing",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex flex-col min-h-screen">
          <header className="border-b px-6 py-4 flex justify-between items-center bg-white">
            <h1 className="text-xl font-bold">
              <Link href="/">Smart Claim Auditor</Link>
            </h1>
            <nav className="flex gap-4">
              <Link href="/" className="text-sm font-medium hover:underline">Dashboard</Link>
              <Link href="/upload" className="text-sm font-medium hover:underline">New Claim</Link>
            </nav>
          </header>
          <main className="flex-1 bg-gray-50 p-6">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
