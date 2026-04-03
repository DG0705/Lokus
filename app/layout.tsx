import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LOKUS - Premium Footwear",
  description: "Where every step finds its place",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Navigation Bar */}
        <nav className="border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <a href="/" className="text-xl font-bold tracking-tight">
              LOKUS
            </a>
            <div className="space-x-6">
              <a href="/men" className="text-gray-600 hover:text-black">Men</a>
              <a href="/women" className="text-gray-600 hover:text-black">Women</a>
              <a href="/cart" className="text-gray-600 hover:text-black">Cart (0)</a>
            </div>
          </div>
        </nav>

        {/* Page Content */}
        {children}
      </body>
    </html>
  );
}