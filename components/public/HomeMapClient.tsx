"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Map, LayoutGrid, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import PublicPropertiesMapLazy from "./PublicPropertiesMapLazy";

interface Property {
  id: string;
  plotNumber: string;
  title: string;
  district: string;
  subcounty?: string | null;
  tenure: string;
  type: string;
  price?: any;
  size: any;
  sizeUnit: string;
  latitude?: number | null;
  longitude?: number | null;
  status: string;
}

const tenureColors: Record<string, string> = {
  TITLED: "bg-green-100 text-green-700",
  MAILO: "bg-blue-100 text-blue-700",
  KIBANJA: "bg-amber-100 text-amber-700",
  LEASEHOLD: "bg-purple-100 text-purple-700",
  FREEHOLD: "bg-teal-100 text-teal-700",
};

function formatUGX(amount: any) {
  if (!amount) return "Price on request";
  return `UGX ${Number(amount).toLocaleString()}`;
}

export default function HomeMapClient({ properties }: { properties: Property[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedProp = properties.find((p) => p.id === selectedId);

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8"
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-brand-blue-pale rounded-lg p-2">
                <Map className="h-5 w-5 text-brand-blue" />
              </div>
              <span className="text-sm font-semibold text-brand-blue uppercase tracking-wide">
                Explore by Map
              </span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">
              Find Properties Across Uganda
            </h2>
            <p className="text-gray-500 mt-2 max-w-xl">
              Navigate the interactive map to discover properties in your preferred location.
              Click any pin to see details.
            </p>
          </div>
          <Button asChild className="bg-brand-red hover:bg-red-700 text-white shrink-0">
            <Link href="/listings?view=map" className="flex items-center gap-2">
              View All on Map <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map — takes 2/3 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-2"
          >
            <PublicPropertiesMapLazy
              properties={properties}
              onSelectProperty={setSelectedId}
              selectedId={selectedId}
              height="520px"
            />
          </motion.div>

          {/* Sidebar — property list + selected detail */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col gap-4"
          >
            {/* Selected property detail */}
            {selectedProp ? (
              <div className="bg-brand-blue rounded-2xl p-5 text-white">
                <div className="text-xs text-blue-200 mb-1">Selected Property</div>
                <div className="font-bold text-lg leading-tight mb-1">{selectedProp.title}</div>
                <div className="text-blue-200 text-sm mb-3">
                  {[selectedProp.subcounty, selectedProp.district].filter(Boolean).join(", ")}
                </div>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="bg-white/10 rounded-lg p-2 text-center">
                    <div className="text-xs text-blue-200">Size</div>
                    <div className="text-sm font-semibold">{Number(selectedProp.size)} {selectedProp.sizeUnit}</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-2 text-center">
                    <div className="text-xs text-blue-200">Tenure</div>
                    <div className="text-sm font-semibold">{selectedProp.tenure}</div>
                  </div>
                </div>
                <div className="text-xl font-bold mb-4">{formatUGX(selectedProp.price)}</div>
                <Button asChild className="w-full bg-white text-brand-blue hover:bg-blue-50 font-semibold">
                  <Link href={`/listings/${selectedProp.plotNumber}`}>
                    View Full Details <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="bg-brand-blue-pale rounded-2xl p-5 text-center">
                <Map className="h-8 w-8 text-brand-blue/40 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Click a pin on the map to see property details here</p>
              </div>
            )}

            {/* Scrollable property list */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex-1">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">
                  {properties.length} Properties
                </span>
                <span className="text-xs text-gray-400">Click to locate</span>
              </div>
              <div className="overflow-y-auto max-h-80 divide-y divide-gray-50">
                {properties.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedId(p.id === selectedId ? null : p.id)}
                    className={`w-full text-left px-4 py-3 hover:bg-brand-blue-pale transition-colors ${
                      selectedId === p.id ? "bg-brand-blue-pale border-l-2 border-brand-blue" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-800 truncate">{p.title}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{p.district}</div>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${tenureColors[p.tenure] || "bg-gray-100 text-gray-600"}`}>
                        {p.tenure}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-brand-blue mt-1">{formatUGX(p.price)}</div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tenure legend */}
        <div className="flex flex-wrap items-center gap-3 mt-6 justify-center">
          <span className="text-xs text-gray-400 mr-1">Tenure:</span>
          {Object.entries(tenureColors).map(([tenure, cls]) => (
            <span key={tenure} className={`text-xs font-semibold px-3 py-1 rounded-full ${cls}`}>
              {tenure}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
