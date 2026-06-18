import type { Metadata } from "next";
import { Inter, Outfit, Barlow_Condensed } from "next/font/google";
import { Toaster } from "sonner";
import { ConfigProvider } from "@/components/ConfigProvider";
import { getPublicConfigSafe } from "@/lib/serverConfig";
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

const SITE_URL = "https://sports-gallery-26.vercel.app";
const SITE_TITLE = "Sports Gallery · FIFA World Cup 2026 – Predict & Win Contest";
const SITE_DESCRIPTION =
  "Submit your predictions for FIFA World Cup 2026 and stand a chance to win exciting prizes.";

export const metadata: Metadata = {
  // metadataBase lets the relative OG/Twitter image path resolve to a fully
  // qualified URL, which social crawlers require.
  metadataBase: new URL(SITE_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: "Sports Gallery 26",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/images/meta-image.png",
        width: 1536,
        height: 1024,
        alt: SITE_TITLE,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/images/meta-image.png"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const config = await getPublicConfigSafe();

  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} ${barlowCondensed.variable} h-full`}>
      <body className="min-h-full flex flex-col">
        <ConfigProvider value={config}>{children}</ConfigProvider>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
