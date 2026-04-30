import { db } from "@/prisma/db";
import HomeMapClient from "./HomeMapClient";

async function getMapProperties() {
  try {
    return await db.property.findMany({
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
    return properties.map((p: any) => ({ ...p, price: Number(p.price), size: Number(p.size) }));
  } catch {
    return [];
  }
}

export default async function HomeMapSection() {
  const properties = await getMapProperties();
  if (properties.length === 0) return null;

  return <HomeMapClient properties={properties as any} />;
}
