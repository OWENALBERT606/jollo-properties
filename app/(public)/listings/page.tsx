import { Metadata } from "next";
import { db } from "@/prisma/db";
import { PropertyType, PropertyTenure } from "@prisma/client";
import ListingsClient from "./ListingsClient";

export const metadata: Metadata = {
  title: "Property Listings in Uganda | Jollo Properties",
  description:
    "Browse and filter properties across Uganda — titled, mailo, freehold, kibanja, and leasehold land. Search by district, type, tenure, and price.",
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL || "https://jollo-properties.vercel.app"}/listings`,
  },
  openGraph: {
    title: "Property Listings in Uganda | Jollo Properties",
    description:
      "Browse and filter properties across Uganda — titled, mailo, freehold, kibanja, and leasehold land. Search by district, type, tenure, and price.",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Uganda Property Listings" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Property Listings in Uganda | Jollo Properties",
    description: "Browse and filter properties across Uganda by district, tenure, type and price.",
    images: ["/og-image.png"],
  },
};

export const dynamic = "force-dynamic";

interface SearchParams {
  q?: string;
  district?: string;
  type?: string;
  tenure?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
  cursor?: string;
  [key: string]: string | undefined;
}

const PAGE_SIZE = 9;

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const where: any = { isPublicListing: true };

  if (sp.q) {
    where.OR = [
      { title: { contains: sp.q, mode: "insensitive" } },
      { plotNumber: { contains: sp.q, mode: "insensitive" } },
      { district: { contains: sp.q, mode: "insensitive" } },
      { address: { contains: sp.q, mode: "insensitive" } },
      { subcounty: { contains: sp.q, mode: "insensitive" } },
    ];
  }
  if (sp.district) where.district = sp.district;
  if (sp.type && sp.type in PropertyType) where.type = sp.type as PropertyType;
  if (sp.tenure && sp.tenure in PropertyTenure) where.tenure = sp.tenure as PropertyTenure;
  if (sp.minPrice || sp.maxPrice) {
    where.price = {};
    if (sp.minPrice) where.price.gte = Number(sp.minPrice);
    if (sp.maxPrice) where.price.lte = Number(sp.maxPrice);
  }

  const orderBy: any =
    sp.sort === "price_asc"
      ? { price: "asc" }
      : sp.sort === "price_desc"
      ? { price: "desc" }
      : { createdAt: "desc" };

  let properties: any[] = [];
  let nextCursor: string | null = null;

  try {
    const query: any = {
      where,
      orderBy,
      take: PAGE_SIZE + 1,
      select: {
        id: true,
        plotNumber: true,
        title: true,
        district: true,
        county: true,
        subcounty: true,
        village: true,
        address: true,
        size: true,
        sizeUnit: true,
        tenure: true,
        type: true,
        status: true,
        price: true,
        latitude: true,
        longitude: true,
        documents: {
          where: { type: "PHOTO" },
          select: { id: true, r2Url: true, name: true, type: true },
          take: 3,
        },
      },
    };
    if (sp.cursor) {
      query.cursor = { id: sp.cursor };
      query.skip = 1;
    }
    const results = await db.property.findMany(query);
    // Convert Prisma Decimal → number for client serialization
    const mapped = results.map((p: any) => ({
      ...p,
      price: p.price ? Number(p.price) : null,
      size: Number(p.size),
    }));
    if (mapped.length > PAGE_SIZE) {
      nextCursor = mapped[PAGE_SIZE].id;
      properties = mapped.slice(0, PAGE_SIZE);
    } else {
      properties = mapped;
    }
  } catch (err) {
    console.error("[ListingsPage] query failed:", err);
    properties = [];
  }

  let mapProperties: any[] = [];
  if (!sp.cursor) {
    try {
      const hasFilters = sp.q || sp.district || sp.type || sp.tenure || sp.minPrice || sp.maxPrice;
      const mapWhere = hasFilters ? where : { isPublicListing: true, latitude: { not: null }, longitude: { not: null } };
      const rawMap = await db.property.findMany({
        where: mapWhere,
        select: {
          id: true,
          plotNumber: true,
          title: true,
          district: true,
          county: true,
          subcounty: true,
          village: true,
          address: true,
          size: true,
          sizeUnit: true,
          tenure: true,
          type: true,
          status: true,
          price: true,
          latitude: true,
          longitude: true,
        },
        orderBy: { createdAt: "desc" },
      });
      mapProperties = rawMap.map((p: any) => ({ ...p, price: Number(p.price), size: Number(p.size) }));
    } catch {
      mapProperties = [];
    }
  }

  return (
    <ListingsClient
      initialProperties={properties}
      nextCursor={nextCursor}
      searchParams={sp}
      showSampleProperties={false}
      mapProperties={mapProperties}
    />
  );
}
