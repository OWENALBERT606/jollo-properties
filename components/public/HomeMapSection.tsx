import { db } from "@/prisma/db";
import HomeMapClient from "./HomeMapClient";

async function getMapProperties() {
  try {
    const rows = await db.property.findMany({
      where: {
        isPublicListing: true,
        latitude: { not: null },
        longitude: { not: null },
      },
      select: {
        id: true,
        plotNumber: true,
        title: true,
        district: true,
        subcounty: true,
        tenure: true,
        type: true,
        price: true,
        size: true,
        sizeUnit: true,
        latitude: true,
        longitude: true,
        status: true,
      },
    });
    // Convert Prisma Decimal → number for React serialization
    return rows.map((p) => ({ ...p, price: p.price ? Number(p.price) : null, size: Number(p.size) }));
  } catch (err) {
    console.error("[HomeMapSection] failed to load properties:", err);
    return [];
  }
}

export default async function HomeMapSection() {
  const properties = await getMapProperties();
  if (properties.length === 0) return null;

  return <HomeMapClient properties={properties as any} />;
}
