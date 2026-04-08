import type { Metadata } from 'next';
import localFont from 'next/font/local';
import Script from 'next/script';

import './globals.css';

import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

const bodyFont = localFont({
  src: '../node_modules/next/dist/compiled/@vercel/og/Geist-Regular.ttf',
  variable: '--font-body',
});

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
    <html lang="en">
      <head>
        <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      </head>
      <body className={bodyFont.variable}>
        <AuthProvider>
          <CartProvider>{children}</CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
