import { MetadataRoute } from "next";
import { db } from "@/prisma/db";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://jollo-properties.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/listings`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  // Dynamic property listing pages
  let propertyRoutes: MetadataRoute.Sitemap = [];
  try {
    const properties = await db.property.findMany({
      where: { isPublicListing: true },
      select: { plotNumber: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    });

    propertyRoutes = properties.map((p) => ({
      url: `${BASE_URL}/listings/${p.plotNumber}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch {
    // DB unavailable at build time — skip dynamic routes
  }

  return [...staticRoutes, ...propertyRoutes];
}
