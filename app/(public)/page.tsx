import { Metadata } from "next";
import HeroSection from "@/components/public/HeroSection";
import StatsBar from "@/components/public/StatsBar";
import HomeMapSection from "@/components/public/HomeMapSection";
import FeaturedListings from "@/components/public/FeaturedListings";
import WhySection from "@/components/public/WhySection";
import ContactSection from "@/components/public/ContactSection";
import NewsletterSection from "@/components/public/NewsletterSection";
import FAQSection from "@/components/public/FAQSection";
import CTASection from "@/components/public/CTASection";

export const dynamic = "force-dynamic";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://jollo-properties.vercel.app";

export const metadata: Metadata = {
  title: "Jollo Properties — Uganda Real Estate & Land Registry",
  description:
    "Find titled, mailo, freehold, and kibanja properties across Uganda. GIS-verified, secure, and transparent land registry platform. Browse plots, houses, and commercial properties.",
  alternates: {
    canonical: BASE_URL,
  },
  openGraph: {
    title: "Jollo Properties — Uganda Real Estate & Land Registry",
    description:
      "Find titled, mailo, freehold, and kibanja properties across Uganda. GIS-verified, secure, and transparent land registry platform.",
    type: "website",
    url: BASE_URL,
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
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  name: "Jollo Properties",
  url: BASE_URL,
  logo: `${BASE_URL}/android-chrome-512x512.png`,
  description:
    "Uganda's trusted land registry and real estate platform. Find titled, mailo, freehold, and kibanja properties across Uganda.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Kireka Shopping Centre",
    addressLocality: "Kampala",
    addressCountry: "UG",
  },
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+256-700-000-000",
    contactType: "customer service",
    availableLanguage: ["English"],
  },
  sameAs: [],
  areaServed: {
    "@type": "Country",
    name: "Uganda",
  },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Jollo Properties",
  url: BASE_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${BASE_URL}/listings?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <HeroSection />
      <HomeMapSection />
      <FeaturedListings />
      <StatsBar />
      <WhySection />
      <ContactSection />
      <NewsletterSection />
      <FAQSection />
      <CTASection />
    </>
  );
}
