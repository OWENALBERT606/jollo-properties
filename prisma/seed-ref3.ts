import { PrismaClient } from "@prisma/client";
const p = new PrismaClient({ datasources: { db: { url: process.env.DIRECT_URL || process.env.DATABASE_URL } } });

async function main() {
  const cats = [
    { name: "Residential Land", slug: "residential-land", description: "Land for residential development" },
    { name: "Commercial Land", slug: "commercial-land", description: "Land for commercial use" },
    { name: "Agricultural Land", slug: "agricultural-land", description: "Farming and agribusiness land" },
    { name: "Industrial Land", slug: "industrial-land", description: "Land for industrial development" },
    { name: "Mixed Use Land", slug: "mixed-use-land", description: "Mixed residential and commercial" },
    { name: "Institutional Land", slug: "institutional-land", description: "Schools, hospitals, churches" },
    { name: "Recreational Land", slug: "recreational-land", description: "Parks, sports grounds, leisure" },
  ];
  for (const c of cats) {
    await p.propertyCategory.upsert({ where: { name: c.name }, update: {}, create: c });
  }
  console.log(`✅ ${cats.length} categories`);

  const tenures = [
    { name: "Freehold", code: "FREEHOLD", description: "Absolute ownership — highest security of tenure" },
    { name: "Mailo", code: "MAILO", description: "Traditional Buganda tenure — held in perpetuity" },
    { name: "Kibanja", code: "KIBANJA", description: "Customary occupancy right on Mailo land" },
    { name: "Leasehold", code: "LEASEHOLD", description: "Land held under a lease for a fixed period" },
    { name: "Titled", code: "TITLED", description: "Land with a registered certificate of title" },
  ];
  for (const t of tenures) {
    await p.tenureType.upsert({ where: { code: t.code }, update: { name: t.name, description: t.description }, create: t });
  }
  console.log(`✅ ${tenures.length} tenure types`);
  console.log("🎉 All reference data seeded!");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => p.$disconnect());
