import { db } from "@/prisma/db";
import FeaturedListingsClient from "./FeaturedListingsClient";

// Uganda regions mapped to districts
const REGIONS: Record<string, string[]> = {
  Central: ["Kampala", "Wakiso", "Mukono", "Entebbe", "Mpigi", "Butebo", "Buikwe"],
  Eastern: ["Jinja", "Mbale", "Tororo", "Iganga", "Busia", "Soroti", "Kamuli"],
  Western: ["Mbarara", "Fort Portal", "Kabale", "Hoima", "Masindi", "Kasese", "Bushenyi"],
  Northern: ["Gulu", "Lira", "Arua", "Kitgum", "Pader", "Apac", "Moroto"],
};

async function getAllPublicProperties() {
  try {
    const rows = await db.property.findMany({
      where: { isPublicListing: true, status: "ACTIVE" },
      include: {
        documents: {
          where: { type: "PHOTO" },
          select: { id: true, r2Url: true, name: true, type: true },
          take: 5,
        },
      },
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      take: 60,
    });
    // Convert Prisma Decimal → number so React can serialize to the client component
    return rows.map((p) => ({
      ...p,
      price: p.price ? Number(p.price) : null,
      size: Number(p.size),
    }));
  } catch (err) {
    console.error("[FeaturedListings] failed to load properties:", err);
    return [];
  }
}

export default async function FeaturedListings() {
  const properties = await getAllPublicProperties();

  // Group by tenure
  const byTenure: Record<string, any[]> = {
    TITLED: [],
    MAILO: [],
    KIBANJA: [],
    LEASEHOLD: [],
    FREEHOLD: [],
  };
  properties.forEach((p) => {
    if (byTenure[p.tenure]) byTenure[p.tenure].push(p);
  });

  // Group by region
  const byRegion: Record<string, any[]> = { Central: [], Eastern: [], Western: [], Northern: [] };
  properties.forEach((p) => {
    for (const [region, districts] of Object.entries(REGIONS)) {
      if (districts.some((d) => p.district.toLowerCase().includes(d.toLowerCase()))) {
        byRegion[region].push(p);
        break;
      }
    }
  });

  return (
    <FeaturedListingsClient
      byTenure={byTenure}
      byRegion={byRegion}
      total={properties.length}
    />
  );
}
