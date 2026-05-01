"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Building2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import PropertyCardSlider from "./PropertyCardSlider";

const TENURE_META: Record<string, { label: string; color: string; dot: string; desc: string }> = {
  TITLED: { label: "Titled", color: "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800", dot: "bg-green-500", desc: "Freehold title deeds — highest security" },
  MAILO: { label: "Mailo", color: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800", dot: "bg-brand-blue", desc: "Traditional Mailo land tenure system" },
  KIBANJA: { label: "Kibanja", color: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800", dot: "bg-amber-500", desc: "Customary occupancy rights" },
  LEASEHOLD: { label: "Leasehold", color: "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800", dot: "bg-purple-500", desc: "Long-term lease agreements" },
  FREEHOLD: { label: "Freehold", color: "bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800", dot: "bg-teal-500", desc: "Absolute ownership rights" },
};

const REGION_META: Record<string, { color: string; dot: string }> = {
  Central: { color: "bg-brand-blue-pale text-brand-blue border-blue-200", dot: "bg-brand-blue" },
  Eastern: { color: "bg-orange-50 text-orange-700 border-orange-200", dot: "bg-orange-500" },
  Western: { color: "bg-green-50 text-green-700 border-green-200", dot: "bg-green-500" },
  Northern: { color: "bg-purple-50 text-purple-700 border-purple-200", dot: "bg-purple-500" },
};

type TabType = "tenure" | "region";

interface Props {
  byTenure: Record<string, any[]>;
  byRegion: Record<string, any[]>;
  total: number;
}

const SHOW = 10;

export default function FeaturedListingsClient({ byTenure, byRegion, total }: Props) {
  const [tabType, setTabType] = useState<TabType>("tenure");
  const [activeTab, setActiveTab] = useState("ALL");

  const tenureTabs = Object.entries(byTenure).filter(([, props]) => props.length > 0);
  const regionTabs = Object.entries(byRegion).filter(([, props]) => props.length > 0);

  // Switch tab type
  function switchType(type: TabType) {
    setTabType(type);
    if (type === "tenure") setActiveTab("ALL");
    else setActiveTab("ALL");
  }

  // Flatten all properties for "ALL" tab — deduplicated by id
  const allTenureProps = Array.from(
    new Map(Object.values(byTenure).flat().map((p) => [p.id, p])).values()
  );
  const allRegionProps = Array.from(
    new Map(Object.values(byRegion).flat().map((p) => [p.id, p])).values()
  );

  const currentProps: any[] =
    tabType === "tenure"
      ? activeTab === "ALL" ? allTenureProps : (byTenure[activeTab] ?? [])
      : activeTab === "ALL" ? allRegionProps : (byRegion[activeTab] ?? []);

  const displayed = currentProps.slice(0, SHOW);
  const hasMore = currentProps.length > SHOW;

  const viewMoreLink =
    tabType === "tenure"
      ? activeTab === "ALL" ? "/listings" : `/listings?tenure=${activeTab}`
      : activeTab === "ALL" ? "/listings" : `/listings?district=${activeTab}`;

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-4"
        >
          <div>
            <span className="inline-flex items-center gap-1.5 bg-brand-blue-pale text-brand-blue text-xs font-semibold px-3 py-1 rounded-full mb-3">
              Featured Listings
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Browse by <span className="text-brand-red">Category</span>
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {total} active listings across Uganda — filter by tenure type or region
            </p>
          </div>
          <Button asChild variant="outline" className="border-brand-blue text-brand-blue hover:bg-brand-blue-pale dark:border-brand-blue dark:text-brand-blue-light shrink-0">
            <Link href="/listings" className="flex items-center gap-2">
              View All Listings <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-sm text-gray-400 dark:text-gray-500 italic mb-7"
        >
          Discover the finest land and property listings across Uganda.
        </motion.p>

        {/* Type switcher — premium pill buttons */}
        <div className="flex items-center gap-3 mb-5">
          <button
            onClick={() => switchType("tenure")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all border ${
              tabType === "tenure"
                ? "bg-brand-blue text-white border-brand-blue shadow-md shadow-brand-blue/20"
                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-brand-blue hover:text-brand-blue"
            }`}
          >
            <Building2 className="h-4 w-4" /> By Tenure
          </button>
          <button
            onClick={() => switchType("region")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all border ${
              tabType === "region"
                ? "bg-brand-blue text-white border-brand-blue shadow-md shadow-brand-blue/20"
                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-brand-blue hover:text-brand-blue"
            }`}
          >
            <MapPin className="h-4 w-4" /> By Region
          </button>
        </div>

        {/* Category tabs */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tabType}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {tabType === "tenure" ? (
              <div className="flex flex-wrap gap-2 mb-6">
                {/* All tab */}
                <button
                  onClick={() => setActiveTab("ALL")}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
                    activeTab === "ALL"
                      ? "bg-brand-blue text-white border-brand-blue shadow-md shadow-brand-blue/20 scale-[1.02]"
                      : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-gray-300"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-gray-400" />
                  All
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === "ALL" ? "bg-white/20" : "bg-gray-100 dark:bg-gray-700"}`}>
                    {allTenureProps.length}
                  </span>
                </button>
                {tenureTabs.map(([tenure, props]) => {
                  const meta = TENURE_META[tenure];
                  const active = activeTab === tenure;
                  return (
                    <button
                      key={tenure}
                      onClick={() => setActiveTab(tenure)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
                        active
                          ? `${meta.color} border shadow-md scale-[1.02]`
                          : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${meta.dot}`} />
                      {meta.label}
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${active ? "bg-white/60" : "bg-gray-100 dark:bg-gray-700"}`}>
                        {props.length}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 mb-6">
                {/* All tab */}
                <button
                  onClick={() => setActiveTab("ALL")}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
                    activeTab === "ALL"
                      ? "bg-brand-blue text-white border-brand-blue shadow-md shadow-brand-blue/20 scale-[1.02]"
                      : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-gray-300"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-gray-400" />
                  All Regions
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === "ALL" ? "bg-white/20" : "bg-gray-100 dark:bg-gray-700"}`}>
                    {allRegionProps.length}
                  </span>
                </button>
                {regionTabs.map(([region, props]) => {
                  const meta = REGION_META[region] ?? { color: "bg-gray-100 text-gray-700 border-gray-200", dot: "bg-gray-400" };
                  const active = activeTab === region;
                  return (
                    <button
                      key={region}
                      onClick={() => setActiveTab(region)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
                        active
                          ? `${meta.color} border shadow-md scale-[1.02]`
                          : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-gray-300"
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${meta.dot}`} />
                      {region} Uganda
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${active ? "bg-white/60" : "bg-gray-100 dark:bg-gray-700"}`}>
                        {props.length}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Active category description (tenure only) */}
        {tabType === "tenure" && activeTab !== "ALL" && TENURE_META[activeTab] && (
          <motion.div
            key={`desc-${activeTab}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 mb-5 bg-white dark:bg-gray-800 rounded-xl px-4 py-3 border border-gray-100 dark:border-gray-700 shadow-sm"
          >
            <span className={`w-3 h-3 rounded-full ${TENURE_META[activeTab].dot}`} />
            <span className="text-sm text-gray-600 dark:text-gray-300">
              <strong className="text-gray-800 dark:text-gray-100">{TENURE_META[activeTab].label} Land:</strong>{" "}
              {TENURE_META[activeTab].desc}
            </span>
            <span className="ml-auto text-sm font-semibold text-brand-blue dark:text-brand-blue-light">
              {currentProps.length} listings
            </span>
          </motion.div>
        )}

        {/* Property grid — 5 per row */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${tabType}-${activeTab}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {displayed.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                <Building2 className="h-10 w-10 text-gray-200 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 dark:text-gray-500 font-medium">No listings in this category yet</p>
                <p className="text-gray-300 dark:text-gray-600 text-sm mt-1">Check back soon or browse all listings</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-5 gap-4">
                {displayed.map((property, i) => (
                  <PropertyCardSlider key={property.id} property={property} index={i} />
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* View more */}
        {(hasMore || currentProps.length > 0) && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700"
          >
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Showing {Math.min(SHOW, currentProps.length)} of {currentProps.length}{" "}
              {activeTab === "ALL"
                ? "properties"
                : tabType === "tenure"
                ? `${TENURE_META[activeTab]?.label ?? activeTab} properties`
                : `${activeTab} properties`}
            </p>
            <Button asChild className="bg-brand-red hover:bg-red-700 text-white flex items-center gap-2">
              <Link href={viewMoreLink}>
                View All {activeTab === "ALL" ? "" : tabType === "tenure" ? `${TENURE_META[activeTab]?.label} ` : `${activeTab} `}Properties
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        )}
      </div>
    </section>
  );
}
