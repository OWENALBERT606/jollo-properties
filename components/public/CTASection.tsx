"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Building2 } from "lucide-react";

export default function CTASection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#0f2060] via-brand-blue to-brand-blue-light py-24">
      {/* Dot grid overlay */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Decorative building icon */}
      <div className="absolute right-8 bottom-0 opacity-[0.05] pointer-events-none select-none">
        <Building2 style={{ width: 200, height: 200 }} className="text-white" />
      </div>

      <div className="relative max-w-4xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {/* Eyebrow pill */}
          <span className="inline-flex items-center gap-1.5 bg-white/10 text-white/90 text-xs font-semibold px-3 py-1 rounded-full mb-5 backdrop-blur-sm border border-white/10">
            Uganda Land Registry
          </span>

          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-5 leading-tight">
            Ready to Find<br className="hidden sm:block" /> Your Land?
          </h2>
          <p className="text-blue-100/80 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            Join thousands of Ugandans who trust Demo Properties for secure, GIS-verified land transactions.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
            <Button
              asChild
              size="lg"
              className="bg-white text-brand-blue hover:bg-blue-50 font-bold text-base px-8 shadow-xl shadow-black/20"
            >
              <Link href="/listings">Browse Listings</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-2 border-white/60 text-white hover:bg-white/10 hover:border-white font-semibold text-base px-8 backdrop-blur-sm"
            >
              <Link href="/register">Register Now</Link>
            </Button>
          </div>

          {/* Trust badges */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
            {["GIS Verified", "Secure Transactions", "Free Registration"].map((badge) => (
              <div key={badge} className="flex items-center gap-2 text-white/70 text-sm font-medium">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white/15 text-white text-xs font-bold shrink-0">
                  ✓
                </span>
                {badge}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
