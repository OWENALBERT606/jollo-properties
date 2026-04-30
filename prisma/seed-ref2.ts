import { PrismaClient } from "@prisma/client";
const p = new PrismaClient({ datasources: { db: { url: process.env.DIRECT_URL || process.env.DATABASE_URL } } });

async function main() {
  console.log("Seeding remaining reference data...");

  // Streets
  const streets = [
    { name: "Kampala Road", subcounty: "Nakasero", district: "Kampala", region: "Central" },
    { name: "Entebbe Road", subcounty: "Nakasero", district: "Kampala", region: "Central" },
    { name: "Jinja Road", subcounty: "Nakasero", district: "Kampala", region: "Central" },
    { name: "Bombo Road", subcounty: "Kawempe", district: "Kampala", region: "Central" },
    { name: "Gayaza Road", subcounty: "Kawempe", district: "Kampala", region: "Central" },
    { name: "Ntinda Road", subcounty: "Ntinda", district: "Kampala", region: "Central" },
    { name: "Portbell Road", subcounty: "Nakawa", district: "Kampala", region: "Central" },
    { name: "Muyenga Road", subcounty: "Makindye", district: "Kampala", region: "Central" },
    { name: "Ggaba Road", subcounty: "Makindye", district: "Kampala", region: "Central" },
    { name: "Namirembe Road", subcounty: "Namirembe", district: "Kampala", region: "Central" },
    { name: "Masaka Road", subcounty: "Lubaga", district: "Kampala", region: "Central" },
    { name: "Hoima Road", subcounty: "Lubaga", district: "Kampala", region: "Central" },
    { name: "Nansana Main Street", subcounty: "Nansana", district: "Wakiso", region: "Central" },
    { name: "Kira Road", subcounty: "Kira", district: "Wakiso", region: "Central" },
    { name: "Entebbe Main Street", subcounty: "Entebbe", district: "Wakiso", region: "Central" },
    { name: "Mukono Main Street", subcounty: "Mukono Town", district: "Mukono", region: "Central" },
    { name: "Seeta Road", subcounty: "Seeta", district: "Mukono", region: "Central" },
    { name: "Main Street Jinja", subcounty: "Jinja Central", district: "Jinja", region: "Eastern" },
    { name: "Nile Avenue", subcounty: "Jinja Central", district: "Jinja", region: "Eastern" },
    { name: "Gulu Main Street", subcounty: "Gulu Central", district: "Gulu", region: "Northern" },
    { name: "Mbarara Main Street", subcounty: "Mbarara Central", district: "Mbarara", region: "Western" },
  ];
  for (const st of streets) {
    await p.street.upsert({ where: { name_district: { name: st.name, district: st.district } }, update: {}, create: st });
  }
  console.log(`✅ ${streets.length} streets`);

  // Main Roads
  const roads = [
    { name: "Kampala-Jinja Highway (A109)", district: "Kampala", region: "Central" },
    { name: "Kampala-Entebbe Expressway", district: "Wakiso", region: "Central" },
    { name: "Kampala-Gulu Highway (A1)", district: "Kampala", region: "Central" },
    { name: "Kampala-Mbarara Highway (A109)", district: "Kampala", region: "Central" },
    { name: "Kampala-Masaka Road", district: "Kampala", region: "Central" },
    { name: "Kampala-Hoima Road", district: "Kampala", region: "Central" },
    { name: "Kampala-Bombo Road", district: "Kampala", region: "Central" },
    { name: "Jinja-Mbale Road", district: "Jinja", region: "Eastern" },
    { name: "Mbale-Tororo Road", district: "Mbale", region: "Eastern" },
    { name: "Gulu-Nimule Road", district: "Gulu", region: "Northern" },
    { name: "Gulu-Kitgum Road", district: "Gulu", region: "Northern" },
    { name: "Mbarara-Kabale Road", district: "Mbarara", region: "Western" },
    { name: "Fort Portal-Kasese Road", district: "Fort Portal", region: "Western" },
    { name: "Masaka-Mbarara Road", district: "Masaka", region: "Central" },
    { name: "Lira-Soroti Road", district: "Lira", region: "Northern" },
  ];
  for (const r of roads) {
    await p.mainRoad.upsert({ where: { name: r.name }, update: {}, create: r });
  }
  console.log(`✅ ${roads.length} roads`);

  // Categories
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

  // Tenure Types
  const tenures = [
    { name: "Freehold", code: "FREEHOLD", description: "Absolute ownership — highest security of tenure" },
    { name: "Mailo", code: "MAILO", description: "Traditional Buganda tenure — held in perpetuity" },
    { name: "Kibanja", code: "KIBANJA", description: "Customary occupancy right on Mailo land" },
    { name: "Leasehold", code: "LEASEHOLD", description: "Land held under a lease for a fixed period" },
    { name: "Titled", code: "TITLED", description: "Land with a registered certificate of title" },
  ];
  for (const t of tenures) {
    await p.tenureType.upsert({ where: { name: t.name }, update: {}, create: t });
  }
  console.log(`✅ ${tenures.length} tenure types`);

  console.log("\n🎉 Done!");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => p.$disconnect());
