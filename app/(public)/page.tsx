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

export const metadata: Metadata = {
  title: "Demo Properties — Uganda Real Estate & Land Registry",
  description:
    "Find titled, mailo, and kibanja properties across Uganda. GIS-verified, secure, and transparent land registry platform.",
  openGraph: {
    title: "Demo Properties — Uganda Real Estate & Land Registry",
    description: "Browse properties across Uganda. Secure land registry platform.",
    type: "website",
  },
};

export default function HomePage() {
  return (
    <>
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
