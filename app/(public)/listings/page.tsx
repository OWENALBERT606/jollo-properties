import { Metadata } from "next";
import { db } from "@/prisma/db";
import { PropertyType, PropertyTenure } from "@prisma/client";
import ListingsClient from "./ListingsClient";

export const metadata: Metadata = {
  title: "Browse Listings | Demo Properties",
  description: "Search and filter properties across Uganda by district, tenure, type and price.",
  openGraph: {
    title: "Browse Listings | Demo Properties",
    description: "Find your perfect property in Uganda.",
  },
};

interface SearchParams {
  district?: string;
  type?: string;
  tenure?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
  cursor?: string;
}

const PAGE_SIZE = 9;

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const where: any = { isPublicListing: true };

  if (searchParams.district) where.district = searchParams.district;
  if (searchParams.type && searchParams.type in PropertyType)
    where.type = searchParams.type as PropertyType;
  if (searchParams.tenure && searchParams.tenure in PropertyTenure)
    where.tenure = searchParams.tenure as PropertyTenure;
  if (searchParams.minPrice || searchParams.maxPrice) {
    where.price = {};
    if (searchParams.minPrice) where.price.gte = Number(searchParams.minPrice);
    if (searchParams.maxPrice) where.price.lte = Number(searchParams.maxPrice);
  }

  const orderBy: any =
    searchParams.sort === "price_asc"
      ? { price: "asc" }
      : searchParams.sort === "price_desc"
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
      },
    };
    if (searchParams.cursor) {
      query.cursor = { id: searchParams.cursor };
      query.skip = 1;
    }
    const results = await db.property.findMany(query);
    if (results.length > PAGE_SIZE) {
      nextCursor = results[PAGE_SIZE].id;
      properties = results.slice(0, PAGE_SIZE);
    } else {
      properties = results;
    }
  } catch {
    properties = [];
  }

  let mapProperties: any[] = [];
  if (!searchParams.cursor) {
    try {
      const hasFilters = searchParams.district || searchParams.type || searchParams.tenure || searchParams.minPrice || searchParams.maxPrice;
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
      searchParams={searchParams}
      showSampleProperties={false}
      mapProperties={mapProperties}
    />
  );
}
