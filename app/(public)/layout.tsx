import type { Metadata } from "next";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";

export const metadata: Metadata = {
  title: {
    template: "%s | Demo Properties",
    default: "Demo Properties — Uganda Real Estate & Land Registry",
  },
  description:
    "Find titled, mailo, and kibanja properties across Uganda. Secure land registry and real estate platform.",
};

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16">{children}</main>
      <Footer />
    </div>
  );
}
