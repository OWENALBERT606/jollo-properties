import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import Providers from "@/components/Providers";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://jollo-properties.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    template: "%s | Jollo Properties",
    default: "Jollo Properties — Uganda Real Estate & Land Registry",
  },
  description:
    "Find titled, mailo, freehold, and kibanja properties across Uganda. GIS-verified, secure, and transparent land registry and real estate platform.",
  keywords: [
    "Uganda real estate",
    "land for sale Uganda",
    "property Uganda",
    "mailo land Uganda",
    "kibanja Uganda",
    "titled land Uganda",
    "freehold land Uganda",
    "Kampala property",
    "Uganda land registry",
    "buy land Uganda",
    "plots for sale Uganda",
    "Uganda property listings",
  ],
  authors: [{ name: "Jollo Properties", url: BASE_URL }],
  creator: "Jollo Properties",
  publisher: "Jollo Properties",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_UG",
    url: BASE_URL,
    siteName: "Jollo Properties",
    title: "Jollo Properties — Uganda Real Estate & Land Registry",
    description:
      "Find titled, mailo, freehold, and kibanja properties across Uganda. GIS-verified, secure, and transparent land registry platform.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Jollo Properties — Uganda Real Estate & Land Registry",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Jollo Properties — Uganda Real Estate & Land Registry",
    description:
      "Find titled, mailo, freehold, and kibanja properties across Uganda. GIS-verified, secure, and transparent land registry platform.",
    images: ["/og-image.png"],
    creator: "@jolloproperties",
  },
  alternates: {
    canonical: BASE_URL,
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png" }],
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geist.variable} ${geistMono.variable} font-sans`}>
        <Providers>{children}</Providers>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
