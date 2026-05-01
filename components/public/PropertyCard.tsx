"use client";

import { motion } from "framer-motion";
import { MapPin, Maximize2, Tag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { ListingProperty } from "@/types/types";

const tenureBadge: Record<string, string> = {
  TITLED: "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300",
  MAILO: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300",
  KIBANJA: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300",
  LEASEHOLD: "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300",
  FREEHOLD: "bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300",
};

const statusBadge: Record<string, string> = {
  DISPUTED: "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300",
  PENDING_APPROVAL: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300",
  TRANSFERRED: "bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300",
};

function formatUGX(amount: any) {
  if (!amount) return "Price on request";
  return `UGX ${Number(amount).toLocaleString()}`;
}

interface Props {
  property: ListingProperty;
  index?: number;
  isFeatured?: boolean;
}

export default function PropertyCard({ property, index = 0, isFeatured }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
      whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(27,63,160,0.12)" }}
      className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 hover:border-brand-blue dark:hover:border-brand-blue group transition-all duration-300"
    >
      {/* Featured shimmer strip */}
      {isFeatured && (
        <div className="h-1 w-full bg-gradient-to-r from-brand-blue via-brand-blue-light to-brand-blue animate-shimmer bg-[length:200%_100%]" />
      )}

      {/* Image area */}
      <Link href={`/listings/${property.plotNumber}`}>
        <div className="relative h-56 overflow-hidden">
          {/* Abstract geometric placeholder */}
          <div className="absolute inset-0 bg-gradient-to-br from-brand-blue-pale dark:from-brand-blue/20 via-blue-100 dark:via-gray-800 to-brand-blue/20 dark:to-brand-blue/10">
            {/* Geometric decoration layers */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-brand-blue/40 dark:bg-brand-blue/60" />
              <div className="absolute bottom-0 -left-6 w-32 h-32 rounded-full bg-brand-blue-light/30 dark:bg-brand-blue-light/40" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rotate-45 bg-brand-blue/20 dark:bg-brand-blue/30" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-brand-blue/15 dark:text-brand-blue/35 text-9xl font-black select-none group-hover:scale-110 transition-transform duration-500 leading-none">
                {property.district[0]}
              </span>
            </div>
          </div>

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-brand-blue/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Tenure badge — top left */}
          <div className="absolute top-3 left-3 z-10">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm bg-white/80 dark:bg-gray-900/80 border border-white/20 ${tenureBadge[property.tenure] || "text-gray-600 dark:text-gray-300"}`}>
              {property.tenure}
            </span>
          </div>

          {/* Status badge — top right */}
          {statusBadge[property.status] && (
            <div className="absolute top-3 right-3 z-10">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm ${statusBadge[property.status]}`}>
                {property.status.replace("_", " ")}
              </span>
            </div>
          )}

          {/* Price pill — overlapping image bottom */}
          <div className="absolute bottom-0 left-4 translate-y-1/2 z-20">
            <span className="bg-white dark:bg-gray-800 text-brand-blue dark:text-brand-blue-light font-extrabold text-sm px-3.5 py-1.5 rounded-full shadow-lg border border-blue-50 dark:border-gray-700 leading-none">
              {formatUGX(property.price)}
            </span>
          </div>

          {/* View details hover pill */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 z-10">
            <span className="bg-white dark:bg-gray-900 text-brand-blue dark:text-brand-blue-light text-xs font-semibold px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
              View Details <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </div>
      </Link>

      {/* Content */}
      <div className="p-4 pt-6">
        <Link href={`/listings/${property.plotNumber}`}>
          <h3 className="font-semibold text-gray-900 dark:text-white text-base line-clamp-1 hover:text-brand-blue transition-colors">
            {property.title}
          </h3>
        </Link>

        <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-sm mt-1">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">
            {[property.subcounty, property.district].filter(Boolean).join(", ")}
          </span>
        </div>

        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <Maximize2 className="h-3.5 w-3.5" />
            {Number(property.size)} {property.sizeUnit}
          </span>
          <span className="flex items-center gap-1">
            <Tag className="h-3.5 w-3.5" />
            {property.type.replace("_", " ")}
          </span>
        </div>

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50 dark:border-gray-700">
          <span className="font-bold text-brand-blue text-base">{formatUGX(property.price)}</span>
          <Button asChild size="sm" className="bg-brand-red hover:bg-red-700 text-white text-xs rounded-lg">
            <Link href={`/listings/${property.plotNumber}`}>
              View Details
            </Link>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
