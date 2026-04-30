"use client";

import { motion } from "framer-motion";
import { ShieldCheck, MapPin, Lock } from "lucide-react";

const features = [
  {
    icon: ShieldCheck,
    title: "Titled Properties",
    desc: "All listings are verified against the Uganda Land Registry. No fake titles, no fraud.",
    color: "bg-brand-red-light text-brand-red",
  },
  {
    icon: MapPin,
    title: "GIS Verified",
    desc: "Every property is geo-referenced with accurate boundary data using modern GIS technology.",
    color: "bg-brand-blue-pale text-brand-blue",
  },
  {
    icon: Lock,
    title: "Secure Transactions",
    desc: "End-to-end encrypted transactions with full audit trails and workflow approvals.",
    color: "bg-brand-red-light text-brand-red",
  },
];

export default function WhySection() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900">Why <span className="text-brand-red">Demo Properties</span>?</h2>
          <p className="text-gray-500 mt-2">Built for Uganda&apos;s unique land ownership landscape</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl border border-gray-100 p-6 hover:shadow-md transition-shadow"
            >
              <div className={`inline-flex p-3 rounded-xl mb-4 ${f.color}`}>
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-gray-900 text-lg mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
