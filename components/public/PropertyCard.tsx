"use client";

import { motion } from "framer-motion";
import { MapPin, Maximize2, Tag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { ListingProperty } from "@/types/types";

const tenureBadge: Record<string, string> = {
  TITLED: "bg-green-100 text-green-700",
  MAILO: "bg-blue-100 text-blue-700",
  KIBANJA: "bg-amber-100 text-amber-700",
  LEASEHOLD: "bg-purple-100 text-purple-700",
  FREEHOLD: "bg-teal-100 text-teal-700",
};

const statusBadge: Record<string, string> = {
  DISPUTED: "bg-red-100 text-red-700",
  PENDING_APPROVAL: "bg-amber-100 text-amber-700",
  TRANSFERRED: "bg-teal-100 text-teal-700",
};

function formatUGX(amount: any) {
  if (!amount) return "Price on request";
  return `UGX ${Number(amount).toLocaleString()}`;
}

interface Props {
  property: ListingProperty;
  index?: number;
}

export default function PropertyCard({ property, index = 0 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
      whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(27,63,160,0.12)" }}
      className="bg-white rounded-2xl overflow-hidden border border-gray-100 group"
    >
      {/* Image */}
      <Link href={`/listings/${property.plotNumber}`}>
        <div className="relative h-52 bg-gradient-to-br from-brand-blue-pale via-blue-100 to-brand-blue/20 flex items-center justify-center overflow-hidden">
          <div className="text-brand-blue/20 text-8xl font-black select-none group-hover:scale-110 transition-transform duration-500">
            {property.district[0]}
          </div>
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-brand-blue/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <div className="absolute top-3 left-3">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${tenureBadge[property.tenure] || "bg-gray-100 text-gray-600"}`}>
              {property.tenure}
            </span>
          </div>

          {statusBadge[property.status] && (
            <div className="absolute top-3 right-3">
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusBadge[property.status]}`}>
                {property.status.replace("_", " ")}
              </span>
            </div>
          )}

          {/* View details hover pill */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
            <span className="bg-white text-brand-blue text-xs font-semibold px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
              View Details <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </div>
      </Link>

      {/* Content */}
      <div className="p-4">
        <Link href={`/listings/${property.plotNumber}`}>
          <h3 className="font-semibold text-gray-900 text-base line-clamp-1 hover:text-brand-blue transition-colors">
            {property.title}
          </h3>
        </Link>

        <div className="flex items-center gap-1 text-gray-500 text-sm mt-1">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">
            {[property.subcounty, property.district].filter(Boolean).join(", ")}
          </span>
        </div>

        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <Maximize2 className="h-3.5 w-3.5" />
            {Number(property.size)} {property.sizeUnit}
          </span>
          <span className="flex items-center gap-1">
            <Tag className="h-3.5 w-3.5" />
            {property.type.replace("_", " ")}
          </span>
        </div>

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
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
