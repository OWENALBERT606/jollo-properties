"use client";

import dynamic from "next/dynamic";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Maximize2, Tag, Calendar, Phone } from "lucide-react";
import type { Property } from "@prisma/client";

const MapPin2 = dynamic(() => import("@/components/shared/PropertyMap"), { ssr: false });

const tenureBadge: Record<string, string> = {
  TITLED: "bg-green-100 text-green-700 border-green-200",
  MAILO: "bg-blue-100 text-blue-700 border-blue-200",
  KIBANJA: "bg-amber-100 text-amber-700 border-amber-200",
  LEASEHOLD: "bg-purple-100 text-purple-700 border-purple-200",
  FREEHOLD: "bg-teal-100 text-teal-700 border-teal-200",
};

function formatUGX(amount: any) {
  if (!amount) return "Price on request";
  return `UGX ${Number(amount).toLocaleString()}`;
}

interface Props {
  property: Property;
  open: boolean;
  onClose: () => void;
}

export default function PropertyDrawer({ property, open, onClose }: Props) {
  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto p-0">
        {/* Header image */}
        <div className="h-48 bg-gradient-to-br from-brand-blue to-brand-blue-light flex items-center justify-center relative">
          <div className="text-white/20 text-8xl font-bold">{property.district[0]}</div>
          <div className="absolute bottom-4 left-4">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${tenureBadge[property.tenure] || ""}`}>
              {property.tenure}
            </span>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <SheetHeader className="text-left p-0">
            <SheetTitle className="text-xl font-bold text-brand-blue">{property.title}</SheetTitle>
            <div className="flex items-center gap-1 text-gray-500 text-sm">
              <MapPin className="h-3.5 w-3.5" />
              {[property.village, property.subcounty, property.district].filter(Boolean).join(", ")}
            </div>
          </SheetHeader>

          {/* Price */}
          <div className="bg-brand-blue-pale rounded-xl p-4">
            <div className="text-2xl font-bold text-brand-blue">{formatUGX(property.price)}</div>
            <div className="text-sm text-gray-500 mt-0.5">Plot No: {property.plotNumber}</div>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Maximize2, label: "Size", value: `${Number(property.size)} ${property.sizeUnit}` },
              { icon: Tag, label: "Type", value: property.type.replace("_", " ") },
              { icon: Calendar, label: "Status", value: property.status.replace("_", " ") },
              { icon: MapPin, label: "County", value: property.county || "—" },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-1.5 text-gray-400 text-xs mb-1">
                  <Icon className="h-3 w-3" />
                  {label}
                </div>
                <div className="text-sm font-medium text-gray-800">{value}</div>
              </div>
            ))}
          </div>

          {/* Description */}
          {property.description && (
            <div>
              <h4 className="font-semibold text-gray-700 mb-2 text-sm">Description</h4>
              <p className="text-sm text-gray-600 leading-relaxed">{property.description}</p>
            </div>
          )}

          {/* Map */}
          {property.latitude && property.longitude && (
            <div>
              <h4 className="font-semibold text-gray-700 mb-2 text-sm">Location</h4>
              <div className="rounded-xl overflow-hidden h-48 border border-gray-200">
                <MapPin2 lat={property.latitude} lng={property.longitude} title={property.title} />
              </div>
            </div>
          )}

          {/* CTA */}
          <Button className="w-full bg-brand-blue hover:bg-brand-blue-light text-white flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Contact Officer
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
