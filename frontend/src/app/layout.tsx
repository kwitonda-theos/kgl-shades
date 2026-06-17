import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import { CartProvider } from "@/context/CartContext";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "KGL SHADES — Luxury Eyewear for the Bold",
  description:
    "Engineered for those who move in darkness. Premium sunglasses with customizable lenses, forged with precision and attitude.",
  keywords: [
    "luxury sunglasses",
    "designer eyewear",
    "streetwear shades",
    "premium sunglasses",
    "KGL Shades",
    "Sunglasses in kigali",
    "kigali sunglasses",
    "sunglasses shop in kigali",
  ],
  openGraph: {
    title: "KGL SHADES — Luxury Eyewear for the Bold",
    description:
      "Engineered for those who move in darkness. Premium sunglasses with customizable lenses.",
    type: "website",
    locale: "en_US",
  },
};

import Script from "next/script";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/* Prevent flash of wrong theme — runs synchronously before paint */}
        <Script
          id="theme-script"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('kgl-theme');if(t==='light')document.documentElement.setAttribute('data-theme','light');})();`,
          }}
        />
      </head>
      <body>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
