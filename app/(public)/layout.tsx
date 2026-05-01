import type { Metadata } from "next";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";
import ChatWidget from "@/components/chat/ChatWidget";

export const metadata: Metadata = {
  title: {
    template: "%s | Jollo Properties",
    default: "Jollo Properties — Uganda Real Estate & Land Registry",
  },
  description:
    "Find titled, mailo, freehold, and kibanja properties across Uganda. GIS-verified, secure, and transparent land registry and real estate platform.",
};

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 pt-16">{children}</main>
      <Footer />
      <ChatWidget />
    </div>
  );
}
