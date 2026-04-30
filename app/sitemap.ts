import { MetadataRoute } from "next";
import { db } from "@/prisma/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXTAUTH_URL || "http://localhost:3000";

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${base}/listings`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.9 },
    { url: `${base}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  ];

  let propertyRoutes: MetadataRoute.Sitemap = [];
  try {
    const properties = await db.property.findMany({
      where: { isPublicListing: true },
      select: { plotNumber: true, updatedAt: true },
    });
    propertyRoutes = properties.map((p) => ({
      url: `${base}/listings/${p.plotNumber}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch {}

  return [...staticRoutes, ...propertyRoutes];
}
