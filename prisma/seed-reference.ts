import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DIRECT_URL || process.env.DATABASE_URL } },
});

// ─── Uganda Reference Data ────────────────────────────────────────────────────

const REGIONS = [
  { name: "Central", description: "Central Region — Kampala, Wakiso, Mukono, Masaka, Luwero" },
  { name: "Eastern", description: "Eastern Region — Jinja, Mbale, Tororo, Soroti, Iganga" },
  { name: "Western", description: "Western Region — Mbarara, Fort Portal, Kabale, Hoima, Kasese" },
  { name: "Northern", description: "Northern Region — Gulu, Lira, Arua, Kitgum, Moroto" },
];

const DISTRICTS = [
  // Central
  { name: "Kampala", region: "Central" },
  { name: "Wakiso", region: "Central" },
  { name: "Mukono", region: "Central" },
  { name: "Masaka", region: "Central" },
  { name: "Luwero", region: "Central" },
  { name: "Mityana", region: "Central" },
  { name: "Mubende", region: "Central" },
  { name: "Nakaseke", region: "Central" },
  { name: "Buikwe", region: "Central" },
  { name: "Kayunga", region: "Central" },
  // Eastern
  { name: "Jinja", region: "Eastern" },
  { name: "Mbale", region: "Eastern" },
  { name: "Tororo", region: "Eastern" },
  { name: "Soroti", region: "Eastern" },
  { name: "Iganga", region: "Eastern" },
  { name: "Busia", region: "Eastern" },
  { name: "Kamuli", region: "Eastern" },
  { name: "Bugiri", region: "Eastern" },
  { name: "Pallisa", region: "Eastern" },
  { name: "Kumi", region: "Eastern" },
  // Western
  { name: "Mbarara", region: "Western" },
  { name: "Fort Portal", region: "Western" },
  { name: "Kabale", region: "Western" },
  { name: "Hoima", region: "Western" },
  { name: "Kasese", region: "Western" },
  { name: "Masindi", region: "Western" },
  { name: "Bushenyi", region: "Western" },
  { name: "Ntungamo", region: "Western" },
  { name: "Rukungiri", region: "Western" },
  { name: "Kyenjojo", region: "Western" },
  // Northern
  { name: "Gulu", region: "Northern" },
  { name: "Lira", region: "Northern" },
  { name: "Arua", region: "Northern" },
  { name: "Kitgum", region: "Northern" },
  { name: "Moroto", region: "Northern" },
  { name: "Apac", region: "Northern" },
  { name: "Nebbi", region: "Northern" },
  { name: "Pader", region: "Northern" },
  { name: "Adjumani", region: "Northern" },
  { name: "Moyo", region: "Northern" },
];

const COUNTIES = [
  // Kampala
  { name: "Kampala Central", district: "Kampala", region: "Central" },
  { name: "Kawempe", district: "Kampala", region: "Central" },
  { name: "Nakawa", district: "Kampala", region: "Central" },
  { name: "Rubaga", district: "Kampala", region: "Central" },
  { name: "Makindye", district: "Kampala", region: "Central" },
  // Wakiso
  { name: "Busiro North", district: "Wakiso", region: "Central" },
  { name: "Busiro South", district: "Wakiso", region: "Central" },
  { name: "Entebbe Municipality", district: "Wakiso", region: "Central" },
  { name: "Kyadondo East", district: "Wakiso", region: "Central" },
  { name: "Kyadondo West", district: "Wakiso", region: "Central" },
  // Mukono
  { name: "Mukono North", district: "Mukono", region: "Central" },
  { name: "Mukono South", district: "Mukono", region: "Central" },
  { name: "Buikwe North", district: "Mukono", region: "Central" },
  // Jinja
  { name: "Jinja Central", district: "Jinja", region: "Eastern" },
  { name: "Butembe", district: "Jinja", region: "Eastern" },
  { name: "Kagoma", district: "Jinja", region: "Eastern" },
  // Mbale
  { name: "Bungokho", district: "Mbale", region: "Eastern" },
  { name: "Bubulo", district: "Mbale", region: "Eastern" },
  // Mbarara
  { name: "Mbarara Municipality", district: "Mbarara", region: "Western" },
  { name: "Kashari North", district: "Mbarara", region: "Western" },
  { name: "Kashari South", district: "Mbarara", region: "Western" },
  // Gulu
  { name: "Gulu Municipality", district: "Gulu", region: "Northern" },
  { name: "Aswa", district: "Gulu", region: "Northern" },
  // Lira
  { name: "Lira Municipality", district: "Lira", region: "Northern" },
  { name: "Erute North", district: "Lira", region: "Northern" },
];

const SUBCOUNTIES = [
  // Kampala Central
  { name: "Nakasero", county: "Kampala Central", district: "Kampala" },
  { name: "Kololo", county: "Kampala Central", district: "Kampala" },
  { name: "Old Kampala", county: "Kampala Central", district: "Kampala" },
  { name: "Kisenyi", county: "Kampala Central", district: "Kampala" },
  // Kawempe
  { name: "Kawempe", county: "Kawempe", district: "Kampala" },
  { name: "Bwaise", county: "Kawempe", district: "Kampala" },
  { name: "Makerere", county: "Kawempe", district: "Kampala" },
  { name: "Mulago", county: "Kawempe", district: "Kampala" },
  // Nakawa
  { name: "Nakawa", county: "Nakawa", district: "Kampala" },
  { name: "Ntinda", county: "Nakawa", district: "Kampala" },
  { name: "Naguru", county: "Nakawa", district: "Kampala" },
  { name: "Mbuya", county: "Nakawa", district: "Kampala" },
  // Rubaga
  { name: "Rubaga", county: "Rubaga", district: "Kampala" },
  { name: "Namirembe", county: "Rubaga", district: "Kampala" },
  { name: "Lubaga", county: "Rubaga", district: "Kampala" },
  // Makindye
  { name: "Makindye", county: "Makindye", district: "Kampala" },
  { name: "Gogonya", county: "Makindye", district: "Kampala" },
  { name: "Kibuye", county: "Makindye", district: "Kampala" },
  // Wakiso
  { name: "Nansana", county: "Kyadondo East", district: "Wakiso" },
  { name: "Kira", county: "Kyadondo East", district: "Wakiso" },
  { name: "Entebbe", county: "Entebbe Municipality", district: "Wakiso" },
  { name: "Kajjansi", county: "Busiro South", district: "Wakiso" },
  // Mukono
  { name: "Mukono Town", county: "Mukono North", district: "Mukono" },
  { name: "Seeta", county: "Mukono North", district: "Mukono" },
  { name: "Namataba", county: "Mukono South", district: "Mukono" },
  // Jinja
  { name: "Jinja Central", county: "Jinja Central", district: "Jinja" },
  { name: "Bugembe", county: "Jinja Central", district: "Jinja" },
  { name: "Masese", county: "Jinja Central", district: "Jinja" },
  // Gulu
  { name: "Gulu Central", county: "Gulu Municipality", district: "Gulu" },
  { name: "Laroo", county: "Gulu Municipality", district: "Gulu" },
  // Mbarara
  { name: "Mbarara Central", county: "Mbarara Municipality", district: "Mbarara" },
  { name: "Kakoba", county: "Mbarara Municipality", district: "Mbarara" },
];

const STREETS = [
  // Kampala
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
  // Wakiso
  { name: "Nansana Main Street", subcounty: "Nansana", district: "Wakiso", region: "Central" },
  { name: "Kira Road", subcounty: "Kira", district: "Wakiso", region: "Central" },
  { name: "Entebbe Main Street", subcounty: "Entebbe", district: "Wakiso", region: "Central" },
  // Mukono
  { name: "Mukono Main Street", subcounty: "Mukono Town", district: "Mukono", region: "Central" },
  { name: "Seeta Road", subcounty: "Seeta", district: "Mukono", region: "Central" },
  // Jinja
  { name: "Main Street Jinja", subcounty: "Jinja Central", district: "Jinja", region: "Eastern" },
  { name: "Nile Avenue", subcounty: "Jinja Central", district: "Jinja", region: "Eastern" },
  // Gulu
  { name: "Gulu Main Street", subcounty: "Gulu Central", district: "Gulu", region: "Northern" },
  // Mbarara
  { name: "Mbarara Main Street", subcounty: "Mbarara Central", district: "Mbarara", region: "Western" },
];

const MAIN_ROADS = [
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

const CATEGORIES = [
  { name: "Residential Land", slug: "residential-land", description: "Land for residential development" },
  { name: "Commercial Land", slug: "commercial-land", description: "Land for commercial use" },
  { name: "Agricultural Land", slug: "agricultural-land", description: "Farming and agribusiness land" },
  { name: "Industrial Land", slug: "industrial-land", description: "Land for industrial development" },
  { name: "Mixed Use Land", slug: "mixed-use-land", description: "Land for mixed residential and commercial use" },
  { name: "Institutional Land", slug: "institutional-land", description: "Land for schools, hospitals, churches" },
  { name: "Recreational Land", slug: "recreational-land", description: "Parks, sports grounds, leisure" },
];

const TENURE_TYPES = [
  { name: "Freehold", code: "FREEHOLD", description: "Absolute ownership — highest security of tenure in Uganda" },
  { name: "Mailo", code: "MAILO", description: "Traditional Buganda tenure — land held in perpetuity by the Mailo owner" },
  { name: "Kibanja", code: "KIBANJA", description: "Customary occupancy right on Mailo land — occupant has right to use and occupy" },
  { name: "Leasehold", code: "LEASEHOLD", description: "Land held under a lease from government or Mailo owner for a fixed period" },
  { name: "Titled", code: "TITLED", description: "Land with a registered certificate of title from the Land Registry" },
];

async function main() {
  console.log("🌱 Seeding Uganda Reference Data...\n");

  // 1. Regions
  console.log("📍 Seeding Regions...");
  for (const r of REGIONS) {
    await prisma.region.upsert({ where: { name: r.name }, update: { description: r.description }, create: r });
  }
  console.log(`   ✅ ${REGIONS.length} regions`);

  // 2. Districts
  console.log("📍 Seeding Districts...");
  for (const d of DISTRICTS) {
    await prisma.district.upsert({ where: { name: d.name }, update: { region: d.region }, create: d });
  }
  console.log(`   ✅ ${DISTRICTS.length} districts`);

  // 3. Counties
  console.log("📍 Seeding Counties...");
  for (const c of COUNTIES) {
    await prisma.county.upsert({
      where: { name_district: { name: c.name, district: c.district } },
      update: {},
      create: c,
    });
  }
  console.log(`   ✅ ${COUNTIES.length} counties`);

  // 4. Subcounties
  console.log("📍 Seeding Subcounties...");
  for (const s of SUBCOUNTIES) {
    await prisma.subcounty.upsert({
      where: { name_county_district: { name: s.name, county: s.county, district: s.district } },
      update: {},
      create: s,
    });
  }
  console.log(`   ✅ ${SUBCOUNTIES.length} subcounties`);

  // 5. Streets / Villages
  console.log("📍 Seeding Streets & Villages...");
  for (const st of STREETS) {
    await prisma.street.upsert({
      where: { name_district: { name: st.name, district: st.district } },
      update: {},
      create: st,
    });
  }
  console.log(`   ✅ ${STREETS.length} streets/villages`);

  // 6. Main Roads
  console.log("📍 Seeding Main Roads...");
  for (const r of MAIN_ROADS) {
    await prisma.mainRoad.upsert({ where: { name: r.name }, update: {}, create: r });
  }
  console.log(`   ✅ ${MAIN_ROADS.length} main roads`);

  // 7. Property Categories
  console.log("📍 Seeding Property Categories...");
  for (const c of CATEGORIES) {
    await prisma.propertyCategory.upsert({ where: { name: c.name }, update: {}, create: c });
  }
  console.log(`   ✅ ${CATEGORIES.length} categories`);

  // 8. Tenure Types
  console.log("📍 Seeding Tenure Types...");
  for (const t of TENURE_TYPES) {
    await prisma.tenureType.upsert({ where: { name: t.name }, update: {}, create: t });
  }
  console.log(`   ✅ ${TENURE_TYPES.length} tenure types`);

  console.log("\n🎉 Reference data seeding complete!");
  console.log(`   Regions:        ${REGIONS.length}`);
  console.log(`   Districts:      ${DISTRICTS.length}`);
  console.log(`   Counties:       ${COUNTIES.length}`);
  console.log(`   Subcounties:    ${SUBCOUNTIES.length}`);
  console.log(`   Streets:        ${STREETS.length}`);
  console.log(`   Main Roads:     ${MAIN_ROADS.length}`);
  console.log(`   Categories:     ${CATEGORIES.length}`);
  console.log(`   Tenure Types:   ${TENURE_TYPES.length}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
