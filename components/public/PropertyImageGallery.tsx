"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X, ZoomIn, Images } from "lucide-react";
import Image from "next/image";

interface Doc { id: string; r2Url: string; name: string; }

interface Props {
  photos: Doc[];
  title: string;
  district: string;
  tenure: string;
}

const tenureColor: Record<string, string> = {
  TITLED: "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300",
  MAILO: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300",
  KIBANJA: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300",
  LEASEHOLD: "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300",
  FREEHOLD: "bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300",
};

export default function PropertyImageGallery({ photos, title, district, tenure }: Props) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const hasPhotos = photos.length > 0;

  function prev() { setActive((i) => (i === 0 ? photos.length - 1 : i - 1)); }
  function next() { setActive((i) => (i === photos.length - 1 ? 0 : i + 1)); }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700">
        {/* Main image */}
        <div className="relative h-72 sm:h-96 bg-gradient-to-br from-brand-blue via-[#1a3580] to-[#0f2060] overflow-hidden group">
          {hasPhotos ? (
            <>
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                  className="absolute inset-0"
                >
                  <Image
                    src={photos[active].r2Url}
                    alt={photos[active].name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 66vw"
                    priority={active === 0}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </motion.div>
              </AnimatePresence>

              {/* Nav arrows */}
              {photos.length > 1 && (
                <>
                  <button
                    onClick={prev}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={next}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}

              {/* Zoom button */}
              <button
                onClick={() => setLightbox(true)}
                className="absolute top-3 right-3 bg-black/40 hover:bg-black/60 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ZoomIn className="h-4 w-4" />
              </button>

              {/* Counter */}
              {photos.length > 1 && (
                <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5">
                  <Images className="h-3 w-3" />
                  {active + 1} / {photos.length}
                </div>
              )}
            </>
          ) : (
            /* Placeholder when no photos */
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-white/10 text-[10rem] font-black leading-none select-none">
                {district[0]}
              </div>
              <div className="absolute bottom-4 left-4">
                <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${tenureColor[tenure] || "bg-gray-100 text-gray-600"}`}>
                  {tenure}
                </span>
              </div>
              <div className="absolute bottom-4 right-4 text-white/50 text-xs flex items-center gap-1">
                <Images className="h-3.5 w-3.5" /> No photos yet
              </div>
            </div>
          )}

          {/* Tenure badge */}
          {hasPhotos && (
            <div className="absolute top-3 left-3">
              <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${tenureColor[tenure] || "bg-gray-100 text-gray-600"}`}>
                {tenure}
              </span>
            </div>
          )}
        </div>

        {/* Thumbnail strip */}
        {photos.length > 1 && (
          <div className="flex gap-2 p-3 overflow-x-auto scrollbar-hide bg-gray-50 dark:bg-gray-900">
            {photos.map((p, i) => (
              <button
                key={p.id}
                onClick={() => setActive(i)}
                className={`relative shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                  i === active ? "border-brand-blue scale-105" : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <Image src={p.r2Url} alt={p.name} fill className="object-cover" sizes="64px" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && hasPhotos && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setLightbox(false)}
          >
            <button
              onClick={() => setLightbox(false)}
              className="absolute top-4 right-4 text-white/70 hover:text-white"
            >
              <X className="h-7 w-7" />
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-3"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            <motion.div
              key={active}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative max-w-4xl max-h-[80vh] w-full h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={photos[active].r2Url}
                alt={photos[active].name}
                fill
                className="object-contain"
                sizes="100vw"
              />
            </motion.div>

            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white rounded-full p-3"
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            <div className="absolute bottom-4 text-white/60 text-sm">
              {active + 1} / {photos.length} — {photos[active].name}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
