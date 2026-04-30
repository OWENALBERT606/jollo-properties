"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, X, LayoutGrid, Map, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PropertyCard from "@/components/public/PropertyCard";
import PublicPropertiesMapLazy from "@/components/public/PublicPropertiesMapLazy";
import type { ListingProperty } from "@/types/types";

const districts = [
  "Kampala","Wakiso","Mukono","Jinja","Entebbe","Gulu","Mbarara",
  "Mbale","Lira","Masaka","Soroti","Arua","Fort Portal","Kabale",
  "Hoima","Masindi","Tororo","Iganga","Busia","Kasese",
];
const types = ["LAND","HOUSE","RESIDENTIAL","COMMERCIAL","AGRICULTURAL","INDUSTRIAL","OTHER"];
const tenures = ["TITLED","MAILO","KIBANJA","LEASEHOLD","FREEHOLD"];
const sorts = [
  { value: "newest", label: "Newest First" },
  { value: "price_asc", label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
];

interface Props {
  initialProperties: ListingProperty[];
  nextCursor: string | null;
  searchParams: Record<string, string | undefined>;
  showSampleProperties?: boolean;
  mapProperties?: ListingProperty[];
}

export default function ListingsClient({ initialProperties, nextCursor, searchParams, showSampleProperties = false, mapProperties = [] }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [view, setView] = useState<"grid" | "map">("grid");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [properties, setProperties] = useState<ListingProperty[]>(initialProperties);
  const [cursor, setCursor] = useState<string | null>(nextCursor);
  const [loading, setLoading] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const [filters, setFilters] = useState({
    district: searchParams.district || "",
    type: searchParams.type || "",
    tenure: searchParams.tenure || "",
    minPrice: searchParams.minPrice || "",
    maxPrice: searchParams.maxPrice || "",
    sort: searchParams.sort || "newest",
  });

  function applyFilters(overrides?: Partial<typeof filters>) {
    const f = { ...filters, ...overrides };
    setFilters(f);
    const params = new URLSearchParams();
    Object.entries(f).forEach(([k, v]) => { if (v) params.set(k, v); });
    router.push(`${pathname}?${params.toString()}`);
  }

  function clearFilters() {
    setFilters({ district: "", type: "", tenure: "", minPrice: "", maxPrice: "", sort: "newest" });
    router.push(pathname);
  }

  const hasFilters = Object.entries(filters).some(([k, v]) => v && k !== "sort");

  function handleMapSelect(id: string) {
    setSelectedId(id);
  }

  useEffect(() => {
    setProperties(initialProperties);
    setCursor(nextCursor);
  }, [initialProperties, nextCursor]);

  const loadMore = useCallback(async () => {
    if (!cursor || loading) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(searchParams).forEach(([k, v]) => { if (v) params.set(k, v); });
      params.set("cursor", cursor);
      const res = await fetch(`/api/properties?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setProperties((prev) => [...prev, ...data.properties]);
        setCursor(data.nextCursor);
      }
    } finally {
      setLoading(false);
    }
  }, [cursor, loading, searchParams]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting && cursor && !loading) loadMore(); },
      { threshold: 0.1 }
    );
    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [cursor, loading, loadMore]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-6">

        {/* Sidebar Filters (PC) */}
        <aside className="hidden md:block w-64 shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Filters</h3>
              {hasFilters && (
                <button onClick={clearFilters} className="text-xs text-brand-blue hover:underline">
                  Clear all
                </button>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">District</label>
                <select
                  value={filters.district}
                  onChange={(e) => setFilters((f) => ({ ...f, district: e.target.value }))}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
                >
                  <option value="">All Districts</option>
                  {districts.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Property Type</label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
                >
                  <option value="">All Types</option>
                  {types.map((t) => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Tenure</label>
                <select
                  value={filters.tenure}
                  onChange={(e) => setFilters((f) => ({ ...f, tenure: e.target.value }))}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
                >
                  <option value="">All Tenures</option>
                  {tenures.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Price Range</label>
                <div className="mt-1 grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => setFilters((f) => ({ ...f, minPrice: e.target.value }))}
                    className="text-sm"
                  />
                  <Input
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters((f) => ({ ...f, maxPrice: e.target.value }))}
                    className="text-sm"
                  />
                </div>
              </div>

              <Button onClick={() => applyFilters()} className="w-full bg-brand-blue hover:bg-brand-blue-light text-white">
                Apply Filters
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1">

          {/* Mobile filter panel - shown at top of listings */}
          <AnimatePresence>
            {filtersOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden overflow-hidden mb-5"
              >
                <div className="bg-brand-blue-pale rounded-2xl p-5 grid grid-cols-2 gap-3">
                  <select
                    value={filters.district}
                    onChange={(e) => setFilters((f) => ({ ...f, district: e.target.value }))}
                    className="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  >
                    <option value="">All Districts</option>
                    {districts.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <select
                    value={filters.type}
                    onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}
                    className="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  >
                    <option value="">All Types</option>
                    {types.map((t) => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
                  </select>
                  <select
                    value={filters.tenure}
                    onChange={(e) => setFilters((f) => ({ ...f, tenure: e.target.value }))}
                    className="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  >
                    <option value="">All Tenures</option>
                    {tenures.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <Input
                    placeholder="Min Price"
                    value={filters.minPrice}
                    onChange={(e) => setFilters((f) => ({ ...f, minPrice: e.target.value }))}
                    className="text-sm bg-white"
                  />
                  <Input
                    placeholder="Max Price"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters((f) => ({ ...f, maxPrice: e.target.value }))}
                    className="text-sm bg-white"
                  />
                  <div className="col-span-2 flex justify-end gap-2">
                    <Button variant="outline" onClick={clearFilters} className="text-gray-500">
                      Clear
                    </Button>
                    <Button onClick={() => applyFilters()} className="bg-brand-blue hover:bg-brand-blue-light text-white">
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Header bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
            <div>
              <h1 className="text-2xl font-bold text-brand-blue">Property Listings</h1>
              <p className="text-gray-500 text-sm mt-0.5">
                {initialProperties.length} properties found
              </p>
              {showSampleProperties && (
                <p className="text-brand-blue text-sm mt-1">Showing sample properties while real listings are being built.</p>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFiltersOpen((v) => !v)}
                className="md:hidden flex items-center gap-2 border-brand-blue text-brand-blue"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {hasFilters && (
                  <span className="bg-brand-blue text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">!</span>
                )}
              </Button>

              {hasFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-gray-400 hover:text-gray-600">
                  <X className="h-4 w-4" />
                </Button>
              )}

              <select
                value={filters.sort}
                onChange={(e) => applyFilters({ sort: e.target.value })}
                className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue bg-white"
              >
                {sorts.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>

              <div className="flex items-center bg-gray-100 rounded-lg p-1 gap-1">
                <button
                  onClick={() => setView("grid")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    view === "grid" ? "bg-white text-brand-blue shadow-sm" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <LayoutGrid className="h-4 w-4" /> Grid
                </button>
                <button
                  onClick={() => setView("map")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    view === "map" ? "bg-white text-brand-blue shadow-sm" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Map className="h-4 w-4" /> Map
                </button>
              </div>
            </div>
          </div>

          {/* Grid View */}
          {view === "grid" && (
            <>
              {properties.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                  <div className="text-6xl mb-4">🏡</div>
                  <h3 className="text-lg font-semibold text-gray-700">No properties found</h3>
                  <p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
                  <Button onClick={clearFilters} className="mt-4 bg-brand-blue text-white">
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {properties.map((p, i) => (
                    <PropertyCard key={p.id} property={p} index={i} />
                  ))}
                </motion.div>
              )}

              <div ref={loadMoreRef} className="h-20 flex items-center justify-center mt-6">
                {loading && (
                  <div className="flex items-center gap-2 text-gray-400">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="text-sm">Loading more...</span>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Map View */}
          {view === "map" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {initialProperties.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                  <Map className="h-12 w-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-400">No properties to show on map</p>
                  <Button onClick={clearFilters} className="mt-4 bg-brand-blue text-white">Clear Filters</Button>
                </div>
              ) : (
                <>
                  <div style={{ height: "600px" }}>
                    <PublicPropertiesMapLazy
                      properties={mapProperties.length > 0 ? mapProperties : initialProperties as any}
                      onSelectProperty={handleMapSelect}
                      selectedId={selectedId}
                      height="600px"
                    />
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-3">
                      Click a pin on the map to highlight a property, or scroll below
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {(mapProperties.length > 0 ? mapProperties : initialProperties)
                        .filter((p: any) => p.latitude && p.longitude)
                        .map((p, i) => (
                          <div
                            key={p.id}
                            onClick={() => handleMapSelect(p.id)}
                            className={`cursor-pointer transition-all ${
                              selectedId === p.id ? "ring-2 ring-brand-blue rounded-2xl scale-[1.02]" : ""
                            }`}
                          >
                            <PropertyCard property={p} index={i} />
                          </div>
                        ))}
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}