"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { z } from "zod";
import { toast } from "sonner";
import { Mail, Bell, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const schema = z.object({
  email: z.string().email(),
});

const perks = [
  "New property listings in your preferred district",
  "Price drops and special offers",
  "Land registry news and policy updates",
  "Market insights and valuation reports",
];

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubscribe() {
    const result = schema.safeParse({ email });
    if (!result.success) {
      toast.error("Please enter a valid email address");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setDone(true);
    setLoading(false);
    toast.success("You're subscribed! Welcome to Demo Properties.");
  }

  return (
    <section className="py-20 bg-brand-red relative overflow-hidden">
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />
      {/* Decorative blobs */}
      <div className="absolute -top-20 -right-20 w-80 h-80 bg-red-400/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left — copy */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-white/10 rounded-lg p-2">
                <Bell className="h-5 w-5 text-white" />
              </div>
              <span className="text-red-100 text-sm font-semibold uppercase tracking-wide">
                Stay Updated
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
              Never Miss a Property Listing
            </h2>
            <p className="text-red-100 mb-8 leading-relaxed">
              Subscribe to our newsletter and be the first to know about new land listings,
              price changes, and land registry updates across Uganda.
            </p>
            <ul className="space-y-3">
              {perks.map((perk) => (
                <li key={perk} className="flex items-start gap-3 text-red-100 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-400 shrink-0 mt-0.5" />
                  {perk}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Right — form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20"
          >
            {done ? (
              <div className="text-center py-8">
                <div className="bg-green-400/20 rounded-full p-4 inline-flex mb-4">
                  <CheckCircle className="h-10 w-10 text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">You&apos;re Subscribed!</h3>
                <p className="text-blue-200 text-sm">
                  Thank you for subscribing. You&apos;ll receive our next newsletter soon.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-white/10 rounded-xl p-3">
                    <Mail className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">Subscribe Now</h3>
                    <p className="text-blue-200 text-xs">Free. Unsubscribe anytime.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-red-100 text-sm font-medium block mb-1.5">
                      Your Email Address
                    </label>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSubscribe()}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:ring-white/30 h-12"
                    />
                  </div>

                  {/* Preference checkboxes */}
                  <div>
                    <label className="text-red-100 text-sm font-medium block mb-2">
                      I&apos;m interested in (optional)
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {["Titled Land", "Mailo Land", "Kibanja", "Agricultural"].map((opt) => (
                        <label
                          key={opt}
                          className="flex items-center gap-2 text-blue-100 text-xs cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            className="rounded border-white/30 bg-white/10 text-brand-blue-light"
                          />
                          {opt}
                        </label>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={handleSubscribe}
                    disabled={loading}
                    className="w-full bg-brand-blue hover:bg-brand-blue-light text-white font-bold h-12 text-base"
                  >
                    {loading ? (
                      <><Loader2 className="h-5 w-5 animate-spin mr-2" /> Subscribing...</>
                    ) : (
                      "Subscribe for Free"
                    )}
                  </Button>

                  <p className="text-red-200 text-xs text-center">
                    We respect your privacy. No spam, ever.
                  </p>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
