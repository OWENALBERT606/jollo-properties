import { Metadata } from "next";
import { db } from "@/prisma/db";
import { notFound } from "next/navigation";
import {
  MapPin, Maximize2, Tag, Calendar, FileText,
  ArrowLeft, Building2, CheckCircle, User, Download,
  Home, TreePine, Factory, Layers, Landmark,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { format } from "date-fns";
import PropertyImageGallery from "@/components/public/PropertyImageGallery";
import PropertyContactCard from "@/components/public/PropertyContactCard";
import PropertyMap from "@/components/shared/PropertyMap";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const property = await db.property.findUnique({
      where: { plotNumber: slug },
    });
    if (!property) return { title: "Property Not Found | Demo Properties" };
    return {
      title: `${property.title} — ${property.district} | Demo Properties`,
      description:
        property.description ||
        `${property.tenure} property in ${property.district}. ${Number(property.size)} ${property.sizeUnit}.`,
      openGraph: {
        title: `${property.title} | Demo Properties`,
        description:
          property.description ||
          `${property.tenure} property in ${property.district}`,
        type: "website",
      },
    };
  } catch {
    return { title: "Property | Demo Properties" };
  }
}

const tenureColor: Record<string, string> = {
  TITLED: "bg-green-100 text-green-700 border-green-200",
  MAILO: "bg-blue-100 text-blue-700 border-blue-200",
  KIBANJA: "bg-amber-100 text-amber-700 border-amber-200",
  LEASEHOLD: "bg-purple-100 text-purple-700 border-purple-200",
  FREEHOLD: "bg-teal-100 text-teal-700 border-teal-200",
};

const statusColor: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700",
  PENDING_APPROVAL: "bg-amber-100 text-amber-700",
  DISPUTED: "bg-red-100 text-red-700",
  TRANSFERRED: "bg-teal-100 text-teal-700",
  DRAFT: "bg-gray-100 text-gray-600",
  ARCHIVED: "bg-gray-100 text-gray-500",
};

const typeIcon: Record<string, any> = {
  RESIDENTIAL: Home,
  COMMERCIAL: Building2,
  AGRICULTURAL: TreePine,
  INDUSTRIAL: Factory,
  LAND: Layers,
  HOUSE: Home,
  OTHER: Layers,
};

function formatUGX(amount: any) {
  if (!amount) return "Price on request";
  return `UGX ${Number(amount).toLocaleString()}`;
}

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let property: any;
  try {
    property = await db.property.findUnique({
      where: { plotNumber: slug },
      include: {
        owners: {
          where: { isActive: true },
          include: { user: { select: { name: true, email: true, phone: true, nin: true, ninVerified: true } } },
        },
        documents: { orderBy: { createdAt: "desc" } },
        valuations: {
          orderBy: { valuationDate: "desc" },
          take: 1,
        },
        _count: { select: { transactions: true, disputes: true } },
      },
    });
  } catch {
    notFound();
  }
  if (!property || !property.isPublicListing) notFound();

  const TypeIcon = typeIcon[property.type] || Building2;
  const photos = property.documents.filter((d: any) => d.type === "PHOTO");
  const otherDocs = property.documents.filter((d: any) => d.type !== "PHOTO");
  const latestValuation = property.valuations?.[0];

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-brand-blue transition-colors">Home</Link>
          <span>/</span>
          <Link href="/listings" className="hover:text-brand-blue transition-colors">Listings</Link>
          <span>/</span>
          <span className="text-gray-800 font-medium truncate max-w-xs">{property.title}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button */}
        <Link
          href="/listings"
          className="inline-flex items-center gap-2 text-sm text-brand-blue hover:text-brand-blue-light mb-6 group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Listings
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── LEFT / MAIN COLUMN ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Image Gallery */}
            <PropertyImageGallery
              photos={photos}
              title={property.title}
              district={property.district}
              tenure={property.tenure}
            />

            {/* Title + badges */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{property.title}</h1>
                  <div className="flex items-center gap-1.5 text-gray-500 text-sm mt-2">
                    <MapPin className="h-4 w-4 shrink-0 text-brand-blue" />
                    <span>
                      {[property.village, property.subcounty, property.county, property.district]
                        .filter(Boolean)
                        .join(", ")}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${tenureColor[property.tenure] || "bg-gray-100 text-gray-600"}`}>
                    {property.tenure}
                  </span>
                  <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${statusColor[property.status] || "bg-gray-100"}`}>
                    {property.status.replace(/_/g, " ")}
                  </span>
                </div>
              </div>

              {/* Quick stats row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-gray-100">
                {[
                  { icon: Maximize2, label: "Size", value: `${Number(property.size)} ${property.sizeUnit}` },
                  { icon: TypeIcon, label: "Type", value: property.type.replace(/_/g, " ") },
                  { icon: Landmark, label: "Plot No.", value: property.plotNumber },
                  { icon: Calendar, label: "Listed", value: format(new Date(property.createdAt), "MMM yyyy") },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-2.5">
                    <div className="bg-brand-blue-pale rounded-lg p-2 shrink-0">
                      <Icon className="h-4 w-4 text-brand-blue" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-400">{label}</div>
                      <div className="text-sm font-semibold text-gray-800">{value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            {property.description && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-3">About This Property</h2>
                <p className="text-gray-600 leading-relaxed">{property.description}</p>
              </div>
            )}

            {/* Full Details Grid */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Property Details</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { label: "Plot Number", value: property.plotNumber },
                  { label: "Title", value: property.title },
                  { label: "District", value: property.district },
                  { label: "County", value: property.county || "—" },
                  { label: "Sub-county", value: property.subcounty || "—" },
                  { label: "Village", value: property.village || "—" },
                  { label: "Address", value: property.address || "—" },
                  { label: "Size", value: `${Number(property.size)} ${property.sizeUnit}` },
                  { label: "Property Type", value: property.type.replace(/_/g, " ") },
                  { label: "Tenure", value: property.tenure },
                  { label: "Status", value: property.status.replace(/_/g, " ") },
                  { label: "Condition", value: property.condition || "—" },
                  ...(latestValuation
                    ? [
                        { label: "Assessed Value", value: `UGX ${Number(latestValuation.valuedAmount).toLocaleString()}` },
                        { label: "Annual Tax", value: `UGX ${Number(latestValuation.taxAmount).toLocaleString()}` },
                      ]
                    : []),
                  { label: "Transactions", value: String(property._count?.transactions ?? 0) },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-3">
                    <div className="text-xs text-gray-400 mb-1">{label}</div>
                    <div className="text-sm font-semibold text-gray-800">{value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Map */}
            {property.latitude && property.longitude && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-brand-blue" /> Location
                </h2>
                <div className="h-80 rounded-xl overflow-hidden border border-gray-200">
                  <PropertyMap
                    lat={property.latitude}
                    lng={property.longitude}
                    title={property.title}
                  />
                </div>
                {property.address && (
                  <p className="text-sm text-gray-500 mt-3 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" /> {property.address}
                  </p>
                )}
              </div>
            )}

            {/* Registered Owners */}
            {property.owners?.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="h-5 w-5 text-brand-blue" /> Registered Owners
                </h2>
                <div className="space-y-3">
                  {property.owners.map((o: any) => (
                    <div
                      key={o.id}
                      className="flex items-center justify-between bg-brand-blue-pale rounded-xl p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-brand-blue rounded-full w-10 h-10 flex items-center justify-center text-white font-bold text-sm shrink-0">
                          {o.user.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                            {o.user.name}
                            {o.isPrimary && (
                              <span className="text-xs bg-brand-blue text-white px-2 py-0.5 rounded-full">Primary</span>
                            )}
                          </div>
                          {o.user.nin && (
                            <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                              NIN: {o.user.nin}
                              {o.user.ninVerified && <CheckCircle className="h-3 w-3 text-green-500" />}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-brand-blue">{Number(o.sharePercentage)}%</div>
                        <div className="text-xs text-gray-400">ownership</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Documents */}
            {otherDocs.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-brand-blue" /> Documents
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {otherDocs.map((doc: any) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between bg-gray-50 rounded-xl p-3 border border-gray-100"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="bg-brand-blue-pale rounded-lg p-2">
                          <FileText className="h-4 w-4 text-brand-blue" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-800 line-clamp-1">{doc.name}</div>
                          <div className="text-xs text-gray-400">{doc.type.replace(/_/g, " ")}</div>
                        </div>
                      </div>
                      <a
                        href={`/api/documents/${doc.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-blue-light hover:text-brand-blue"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT / SIDEBAR ── */}
          <div className="space-y-5">
            {/* Price card */}
            <div className="bg-brand-blue rounded-2xl p-6 text-white sticky top-20">
              <div className="text-sm text-blue-200 mb-1">Asking Price</div>
              <div className="text-3xl font-bold mb-1">{formatUGX(property.price)}</div>
              <div className="text-blue-200 text-xs mb-5">Plot No: {property.plotNumber}</div>

              <div className="space-y-2">
                <PropertyContactCard 
                  plotNumber={property.plotNumber} 
                  title={property.title}
                  district={property.district}
                  tenure={property.tenure}
                  type={property.type}
                  price={Number(property.price)}
                  size={Number(property.size)}
                  sizeUnit={property.sizeUnit}
                  address={property.address}
                />
                <Button
                  variant="outline"
                  className="w-full border-white/30 text-white hover:bg-white/10 bg-transparent"
                  asChild
                >
                  <Link href="/listings">← Back to Listings</Link>
                </Button>
              </div>
            </div>

            {/* Key facts */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4">Key Facts</h3>
              <div className="space-y-3">
                {[
                  { label: "Tenure Type", value: property.tenure },
                  { label: "Property Type", value: property.type.replace(/_/g, " ") },
                  { label: "Land Size", value: `${Number(property.size)} ${property.sizeUnit}` },
                  { label: "District", value: property.district },
                  ...(property.condition ? [{ label: "Condition", value: property.condition }] : []),
                  ...(latestValuation
                    ? [{ label: "Last Valued", value: format(new Date(latestValuation.valuationDate), "MMM yyyy") }]
                    : []),
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                    <span className="text-sm text-gray-500">{label}</span>
                    <span className="text-sm font-semibold text-gray-800">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Share */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-3">Share This Property</h3>
              <div className="flex gap-2">
                {["WhatsApp", "Copy Link"].map((s) => (
                  <button
                    key={s}
                    className="flex-1 text-xs font-medium py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-brand-blue-pale hover:border-brand-blue hover:text-brand-blue transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
