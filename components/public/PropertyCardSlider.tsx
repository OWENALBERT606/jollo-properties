"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Maximize2, Tag, ArrowRight, ChevronLeft, ChevronRight, Images } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

const tenureBadge: Record<string, string> = {
  TITLED: "bg-green-100 text-green-700",
  MAILO: "bg-blue-100 text-blue-700",
  KIBANJA: "bg-amber-100 text-amber-700",
  LEASEHOLD: "bg-purple-100 text-purple-700",
  FREEHOLD: "bg-teal-100 text-teal-700",
};

const tenureBg: Record<string, string> = {
  TITLED: "from-green-900 to-green-700",
  MAILO: "from-brand-blue to-[#1a3580]",
  KIBANJA: "from-amber-800 to-amber-600",
  LEASEHOLD: "from-purple-900 to-purple-700",
  FREEHOLD: "from-teal-900 to-teal-700",
};

function formatUGX(amount: any) {
  if (!amount) return "Price on request";
  const n = Number(amount);
  if (n >= 1_000_000_000) return `UGX ${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `UGX ${(n / 1_000_000).toFixed(0)}M`;
  return `UGX ${n.toLocaleString()}`;
}

interface Doc { id: string; r2Url: string; name: string; }

interface Props {
  property: any;
  index?: number;
}

export default function PropertyCardSlider({ property, index = 0 }: Props) {
  const photos: Doc[] = (property.documents || []).filter((d: any) => d.type === "PHOTO");
  const [imgIdx, setImgIdx] = useState(0);

  function prevImg(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setImgIdx((i) => (i === 0 ? photos.length - 1 : i - 1));
  }
  function nextImg(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setImgIdx((i) => (i === photos.length - 1 ? 0 : i + 1));
  }

  const bg = tenureBg[property.tenure] || "from-brand-blue to-[#1a3580]";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -3, boxShadow: "0 16px 40px rgba(27,63,160,0.13)" }}
      className="bg-white rounded-2xl overflow-hidden border border-gray-100 group flex flex-col"
    >
      {/* ── Image slider ── */}
      <div className="relative h-44 overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          {photos.length > 0 ? (
            <motion.div
              key={imgIdx}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0"
            >
              <Image
                src={photos[imgIdx].r2Url}
                alt={photos[imgIdx].name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 300px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </motion.div>
          ) : (
            <motion.div
              key="placeholder"
              className={`absolute inset-0 bg-gradient-to-br ${bg} flex items-center justify-center`}
            >
              <span className="text-white/15 text-7xl font-black select-none">
                {property.district?.[0] ?? "U"}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Prev/Next arrows — only when multiple photos */}
        {photos.length > 1 && (
          <>
            <button
              onClick={prevImg}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={nextImg}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
            {/* Dot indicators */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
              {photos.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setImgIdx(i); }}
                  className={`rounded-full transition-all ${i === imgIdx ? "w-4 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/50"}`}
                />
              ))}
            </div>
          </>
        )}

        {/* Photo count badge */}
        {photos.length > 0 && (
          <div className="absolute top-2 right-2 z-10 bg-black/40 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
            <Images className="h-3 w-3" /> {photos.length}
          </div>
        )}

        {/* Tenure badge */}
        <div className="absolute top-2 left-2 z-10">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${tenureBadge[property.tenure] || "bg-gray-100 text-gray-600"}`}>
            {property.tenure}
          </span>
        </div>

        {/* Hover CTA */}
        <Link href={`/listings/${property.plotNumber}`} className="absolute inset-0 z-[5]">
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 whitespace-nowrap">
            <span className="bg-white text-brand-blue text-xs font-semibold px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
              View Details <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </Link>
      </div>

      {/* ── Content ── */}
      <div className="p-3 flex flex-col flex-1">
        <Link href={`/listings/${property.plotNumber}`}>
          <h3 className="font-semibold text-gray-900 text-sm line-clamp-1 hover:text-brand-blue transition-colors leading-snug">
            {property.title}
          </h3>
        </Link>

        <div className="flex items-center gap-1 text-gray-400 text-xs mt-1">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">{[property.subcounty, property.district].filter(Boolean).join(", ")}</span>
        </div>

        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Maximize2 className="h-3 w-3" />
            {Number(property.size)} {property.sizeUnit}
          </span>
          <span className="flex items-center gap-1">
            <Tag className="h-3 w-3" />
            {property.type.replace(/_/g, " ")}
          </span>
        </div>

        <div className="flex items-center justify-between pt-2.5 border-t border-gray-50 mt-auto">
          <span className="font-bold text-brand-blue text-sm">{formatUGX(property.price)}</span>
          <Button asChild size="sm" className="bg-brand-red hover:bg-red-700 text-white text-xs h-7 px-3 rounded-lg">
            <Link href={`/listings/${property.plotNumber}`}>View</Link>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
