import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// The path goes up one level out of 'app' and into 'components'
import Navbar from "../components/Navbar"; 

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LOKUS | The Ultimate Sneaker Destination",
  description: "Cop the latest sneaker drops and manage your personal vault.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar /> 
        {children}
      </body>
    </html>
  );
}