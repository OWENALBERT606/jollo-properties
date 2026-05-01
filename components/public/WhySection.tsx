"use client";

import { motion } from "framer-motion";
import { ShieldCheck, MapPin, Lock } from "lucide-react";

const features = [
  {
    icon: ShieldCheck,
    title: "Titled Properties",
    desc: "All listings are verified against the Uganda Land Registry. No fake titles, no fraud.",
    color: "bg-brand-red-light text-brand-red",
    gradient: "from-brand-red to-red-400",
    topBorder: "border-t-brand-red",
    step: "01",
  },
  {
    icon: MapPin,
    title: "GIS Verified",
    desc: "Every property is geo-referenced with accurate boundary data using modern GIS technology.",
    color: "bg-brand-blue-pale text-brand-blue",
    gradient: "from-brand-blue to-brand-blue-light",
    topBorder: "border-t-brand-blue",
    step: "02",
  },
  {
    icon: Lock,
    title: "Secure Transactions",
    desc: "End-to-end encrypted transactions with full audit trails and workflow approvals.",
    color: "bg-brand-red-light text-brand-red",
    gradient: "from-brand-red to-red-400",
    topBorder: "border-t-brand-red",
    step: "03",
  },
];

export default function WhySection() {
  return (
    <section className="py-20 bg-brand-blue-pale/20 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-1.5 bg-brand-blue-pale text-brand-blue text-xs font-semibold px-3 py-1 rounded-full mb-3">
            Why Choose Us
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            Why <span className="text-brand-red">Demo Properties</span>?
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-3 max-w-xl mx-auto">
            Built for Uganda&apos;s unique land ownership landscape
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative rounded-2xl border-t-4 ${f.topBorder} border-x border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-7 shadow-sm hover:shadow-xl hover:shadow-brand-blue/10 hover:-translate-y-1.5 transition-all duration-300 group overflow-hidden`}
            >
              {/* Step indicator — top right */}
              <div className="absolute top-5 right-5 text-3xl font-black text-gray-100 dark:text-gray-700 select-none leading-none group-hover:text-gray-200 dark:group-hover:text-gray-600 transition-colors">
                {f.step}
              </div>

              {/* Gradient icon container */}
              <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${f.gradient} shadow-md mb-5`}>
                <f.icon className="h-8 w-8 text-white" />
              </div>

              <h3 className="font-bold text-gray-900 dark:text-white text-xl mb-3 leading-snug">{f.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
