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
  ],
  openGraph: {
    title: "KGL SHADES — Luxury Eyewear for the Bold",
    description:
      "Engineered for those who move in darkness. Premium sunglasses with customizable lenses.",
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable}`}
    >
      <body>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
