import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

// Font setup
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

// Metadata for the application
export const metadata: Metadata = {
  title: "StockPulse | Real-time Stock Monitoring",
  description: "Track stock trends, alerts, and insights in real-time.",
};


function Header() {
  return (
    <header className="p-4 shadow-md bg-white dark:bg-gray-900 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">📈 StockPulse</h1>
        <nav className="space-x-4 text-sm">
          <Link href="/" className="hover:underline">Dashboard</Link>
          <Link href="/watchlist" className="hover:underline">Watchlist</Link>
          <Link href="/alerts" className="hover:underline">Alerts</Link>
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="p-4 bg-gray-100 dark:bg-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto text-sm text-gray-500 text-center">
        &copy; {new Date().getFullYear()} StockPulse. All rights reserved.
      </div>
    </footer>
  );
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-black dark:bg-black dark:text-white`}
      >
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1 max-w-7xl mx-auto w-full px-4">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
