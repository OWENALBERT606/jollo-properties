"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Image from "next/image";

// Land-focused images — open fields, aerial plots, agricultural land, surveyed parcels
const slides = [
  {
    url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920&q=80",
    label: "Agricultural Land",
    sub: "Fertile, productive land across Uganda's regions",
  },
  {
    url: "/HERO/Cheap-plots-for-sale-in-Kisubi-Wamala-Entebbe-road-2-592x444.jpeg",
    label: "Prime Land Plots",
    sub: "Surveyed and titled plots ready for development",
  },
  {
    url: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1920&q=80",
    label: "Open Land Parcels",
    sub: "Vast open land available across all districts",
  },
  {
    url: "/HERO/Plots-for-Sale-in-Uganda.jpg",
    label: "Mailo & Kibanja Land",
    sub: "Registered land under all tenure types in Uganda",
  },
  {
    url: "/HERO/FB_IMG_1633584699349.jpg",
    label: "Scenic Land Parcels",
    sub: "Beautiful land with stunning natural surroundings",
  },
];

const districts = ["Kampala","Wakiso","Mukono","Jinja","Entebbe","Gulu","Mbarara","Mbale","Lira","Masaka"];
const propertyTypes = ["Land","House","Residential","Commercial","Agricultural","Industrial","Other"];
const tenures = ["Titled","Mailo","Kibanja","Leasehold","Freehold"];

const INTERVAL = 5000;

export default function HeroSection() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [district, setDistrict] = useState("");
  const [type, setType] = useState("");
  const [tenure, setTenure] = useState("");
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => setCurrent((i) => (i + 1) % slides.length), []);
  const prev = useCallback(() => setCurrent((i) => (i === 0 ? slides.length - 1 : i - 1)), []);

  // Auto-advance
  useEffect(() => {
    if (paused) return;
    const timer = setInterval(next, INTERVAL);
    return () => clearInterval(timer);
  }, [next, paused]);

  function handleSearch() {
    const params = new URLSearchParams();
    if (district) params.set("district", district);
    if (type) params.set("type", type.toUpperCase().replace(/ /g, "_"));
    if (tenure) params.set("tenure", tenure.toUpperCase());
    router.push(`/listings?${params.toString()}`);
  }

  return (
    <section
      className="relative min-h-[92vh] flex items-center overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* ── Background carousel ── */}
      <AnimatePresence initial={false}>
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.1, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <Image
            src={slides[current].url}
            alt={slides[current].label}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        </motion.div>
      </AnimatePresence>

      {/* Dark gradient overlay — stronger at bottom for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-brand-blue/75 via-brand-blue/60 to-[#0f2060]/85" />

      {/* Subtle dot pattern on top */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* ── Prev / Next arrows ── */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/10 hover:bg-white/25 backdrop-blur-sm text-white rounded-full p-3 transition-all border border-white/20 hover:scale-110"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/10 hover:bg-white/25 backdrop-blur-sm text-white rounded-full p-3 transition-all border border-white/20 hover:scale-110"
        aria-label="Next slide"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* ── Slide label (bottom-left) ── */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 text-center pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.p
            key={`label-${current}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4 }}
            className="text-white/70 text-sm font-medium tracking-wide"
          >
            {slides[current].sub}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* ── Dot indicators ── */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Go to slide ${i + 1}`}
            className="group relative"
          >
            <span
              className={`block rounded-full transition-all duration-300 ${
                i === current
                  ? "w-8 h-2.5 bg-white"
                  : "w-2.5 h-2.5 bg-white/40 hover:bg-white/70"
              }`}
            />
            {/* Progress bar on active dot */}
            {i === current && !paused && (
              <motion.span
                key={`progress-${current}`}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: INTERVAL / 1000, ease: "linear" }}
                className="absolute inset-0 rounded-full bg-brand-blue-light origin-left"
              />
            )}
          </button>
        ))}
      </div>

      {/* ── Main content ── */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          {/* Badge */}
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-block bg-white/10 backdrop-blur-sm text-blue-100 text-sm font-medium px-5 py-2 rounded-full mb-6 border border-white/20"
          >
            Uganda&apos;s #1 Land Registry Platform
          </motion.span>

          {/* Headline — animates per slide */}
          <AnimatePresence mode="wait">
            <motion.h1
              key={`title-${current}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="text-4xl md:text-6xl font-bold text-white leading-tight mb-6 drop-shadow-lg"
            >
              {slides[current].label}
              <br />
              <span className="text-brand-blue-light">in Uganda</span>
            </motion.h1>
          </AnimatePresence>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-blue-100 text-lg md:text-xl max-w-2xl mx-auto drop-shadow"
          >
            Browse titled, mailo, and kibanja properties across all districts.
            GIS-verified, secure, and transparent.
          </motion.p>
        </motion.div>

        {/* ── Search bar ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-2xl max-w-4xl mx-auto border border-white/50"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-blue bg-gray-50"
            >
              <option value="">All Districts</option>
              {districts.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-blue bg-gray-50"
            >
              <option value="">Property Type</option>
              {propertyTypes.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <select
              value={tenure}
              onChange={(e) => setTenure(e.target.value)}
              className="px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-blue bg-gray-50"
            >
              <option value="">Tenure Type</option>
              {tenures.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <Button
              onClick={handleSearch}
              className="bg-brand-red hover:bg-red-700 text-white rounded-xl py-3 font-semibold flex items-center justify-center gap-2 shadow-lg"
            >
              <Search className="h-4 w-4" />
              Search
            </Button>
          </div>
        </motion.div>

        {/* Quick stats strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex flex-wrap justify-center gap-6 mt-10"
        >
          {[
            { value: "1,240+", label: "Properties Listed" },
            { value: "45", label: "Districts Covered" },
            { value: "3,800+", label: "Happy Clients" },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <div className="text-2xl font-bold text-white drop-shadow">{value}</div>
              <div className="text-blue-200 text-xs mt-0.5">{label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
