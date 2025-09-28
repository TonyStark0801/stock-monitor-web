import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import AnimatedBackground from "@/components/AnimatedBackground";
import "./globals.css";

// Font setup
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

// Metadata for the application
export const metadata: Metadata = {
  title: "StockPulse | Real-time Stock Monitoring",
  description: "Track stock trends, alerts, and insights in real-time.",
};

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
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-stock text-white relative overflow-x-hidden`}
      >
        <AnimatedBackground />
        <AuthProvider>
          <div className="flex flex-col min-h-screen relative z-10">
            <Header />
            <main className="flex-1 max-w-7xl mx-auto w-full px-4">{children}</main>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
