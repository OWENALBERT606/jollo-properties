"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, HelpCircle } from "lucide-react";

const faqs = [
  {
    category: "Land Ownership",
    items: [
      {
        q: "What is the difference between Mailo, Kibanja, Titled, Leasehold and Freehold land?",
        a: "Mailo land is a form of tenure unique to Uganda where the owner holds the land in perpetuity. Kibanja is a customary occupancy right on Mailo land. Titled (Freehold) land gives absolute ownership with a certificate of title. Leasehold is land held for a fixed period under a lease agreement from the government or a Mailo owner.",
      },
      {
        q: "How do I verify that a land title is genuine?",
        a: "You can verify a land title through the Uganda Land Information System (ULIS) at the Ministry of Lands, or through our platform which cross-references the national land registry. Always insist on a search certificate before any transaction.",
      },
      {
        q: "Can a foreigner own land in Uganda?",
        a: "Foreigners cannot own Mailo or freehold land in Uganda. However, they can hold land under leasehold tenure for up to 99 years. All transactions must comply with the Land Act Cap 227.",
      },
    ],
  },
  {
    category: "Buying & Selling",
    items: [
      {
        q: "What documents do I need to buy land in Uganda?",
        a: "You need: a valid National ID or passport, a land search certificate, the original title deed, a sale agreement signed by both parties, consent from the land board (for Mailo land), and a transfer form. We recommend engaging a licensed advocate.",
      },
      {
        q: "How long does a land transfer take?",
        a: "A straightforward land transfer typically takes 2–6 weeks depending on the district land board's workload. Transfers in Kampala and Wakiso may take longer due to high volumes. Our officers can guide you through the process.",
      },
      {
        q: "What taxes are payable when buying land?",
        a: "The buyer pays stamp duty (1.5% of the property value) and registration fees. The seller may be liable for capital gains tax. Annual property rates are payable to the local government based on the assessed value.",
      },
    ],
  },
  {
    category: "Using Demo Properties",
    items: [
      {
        q: "How do I list my property on Demo Properties?",
        a: "Contact one of our registered Land Officers who will verify your title, conduct a site visit, and register the property on the platform. All listings are GIS-verified before going live.",
      },
      {
        q: "Is my personal information safe on this platform?",
        a: "Yes. We use industry-standard encryption and never share your personal data with third parties without consent. All document uploads are stored securely on Cloudflare R2 with access-controlled presigned URLs.",
      },
      {
        q: "How do I report a dispute about a listed property?",
        a: "You can file a dispute directly through your account dashboard or contact our office. Our Land Officers will investigate and follow the formal dispute resolution process under the Land Act.",
      },
    ],
  },
];

const categoryColors = ["bg-brand-blue text-white", "bg-brand-red text-white", "bg-brand-blue text-white"];

export default function FAQSection() {
  const [openItem, setOpenItem] = useState<string | null>("0-0");

  function toggle(key: string) {
    setOpenItem((prev) => (prev === key ? null : key));
  }

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <div className="flex justify-center mb-4">
            <div className="bg-brand-blue-pale rounded-2xl p-3">
              <HelpCircle className="h-7 w-7 text-brand-blue" />
            </div>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-3 max-w-xl mx-auto">
            Everything you need to know about land ownership, buying, selling, and using
            Demo Properties in Uganda.
          </p>
        </motion.div>

        {/* FAQ groups */}
        <div className="space-y-8">
          {faqs.map((group, gi) => (
            <motion.div
              key={group.category}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: gi * 0.1 }}
            >
              {/* Category label */}
              <div className="flex items-center gap-3 mb-4">
                <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${categoryColors[gi] ?? "bg-brand-blue text-white"}`}>
                  {group.category}
                </span>
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
              </div>

              {/* Items */}
              <div className="space-y-3">
                {group.items.map((item, ii) => {
                  const key = `${gi}-${ii}`;
                  const open = openItem === key;
                  return (
                    <div
                      key={key}
                      className={`bg-white dark:bg-gray-800 rounded-2xl border transition-all duration-200 overflow-hidden ${
                        open ? "border-brand-red shadow-sm" : "border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600"
                      }`}
                    >
                      <button
                        onClick={() => toggle(key)}
                        className="w-full flex items-start justify-between gap-4 px-6 py-5 text-left"
                      >
                        <span className={`font-semibold text-sm leading-snug ${open ? "text-brand-red" : "text-gray-800 dark:text-gray-100"}`}>
                          {item.q}
                        </span>
                        <span className={`shrink-0 rounded-full p-1 transition-colors ${open ? "bg-brand-red text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"}`}>
                          {open ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                        </span>
                      </button>

                      <AnimatePresence initial={false}>
                        {open && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: "easeInOut" }}
                          >
                            <div className="px-6 pb-5 text-gray-600 dark:text-gray-300 text-sm leading-relaxed border-t border-gray-50 dark:border-gray-700 pt-4">
                              {item.a}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
