import type { Metadata } from "next";
import { Inter, Outfit, Barlow_Condensed } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-body-google",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const outfit = Outfit({
  variable: "--font-heading-google",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
});

const barlowCondensed = Barlow_Condensed({
  variable: "--font-display-google",
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "FIFA World Cup 2026 – Predict & Win Contest",
  description: "Submit your predictions for FIFA World Cup 2026 and stand a chance to win exciting prizes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} ${barlowCondensed.variable} h-full`}>
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
