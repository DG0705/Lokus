import type { Metadata } from 'next';
import Script from 'next/script';

import './globals.css';

import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

export const metadata: Metadata = {
  title: 'LOKUS | Premium Multi-Brand Shoe Store',
  description: "A premium India-first destination for curated footwear from the world's leading brands.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      </head>
      <body>
        <AuthProvider>
          <CartProvider>{children}</CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
