import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DIRECT_URL || process.env.DATABASE_URL } },
});

async function main() {
  console.log("🌱 Seeding Demo Properties...");

  // Check if reference data already exists
  const existingRegions = await prisma.region.count();
  if (existingRegions > 0) {
    console.log("Reference data already seeded, skipping reference data...");
  } else {
    // ========== REFERENCE DATA ==========
    console.log("📍 Seeding Reference Data...");

    // Regions
    const regions = [
      { name: "Central", description: "Central Region of Uganda including Kampala" },
      { name: "Eastern", description: "Eastern Region including Jinja, Bugiri" },
      { name: "Western", description: "Western Region including Mbarara, Kasese" },
      { name: "Northern", description: "Northern Region including Gulu, Lira" },
    ];
    for (const r of regions) {
      await prisma.region.upsert({ where: { name: r.name }, update: {}, create: r });
    }

    // ... rest of reference data seeding code
    console.log("✅ Reference data seeded!");
  }

  // Admin user
  const adminHash = await hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@demoproperties.ug" },
    update: {},
    create: {
      name: "System Admin",
      email: "admin@demoproperties.ug",
      passwordHash: adminHash,
      role: "ADMIN",
      phone: "+256700000001",
    },
  });

  // Land Officers
  const officerHash = await hash("officer123", 12);
  const officer1 = await prisma.user.upsert({
    where: { email: "officer1@demoproperties.ug" },
    update: {},
    create: {
      name: "Grace Nakato",
      email: "officer1@demoproperties.ug",
      passwordHash: officerHash,
      role: "LAND_OFFICER",
      phone: "+256700000002",
      nin: "CM90100012345A",
    },
  });

  const officer2 = await prisma.user.upsert({
    where: { email: "officer2@demoproperties.ug" },
    update: {},
    create: {
      name: "Robert Ssemakula",
      email: "officer2@demoproperties.ug",
      passwordHash: officerHash,
      role: "LAND_OFFICER",
      phone: "+256700000003",
      nin: "CM90100012346B",
    },
  });

  // Public users - sequential to pooler connection limits
  const userHash = await hash("user123", 12);
  const userDefs = [
    { name: "James Mukasa", email: "james@example.com", phone: "+256700000010", nin: "CM90100012347C" },
    { name: "Sarah Namukasa", email: "sarah@example.com", phone: "+256700000011", nin: "CM90100012348D" },
    { name: "Peter Ochieng", email: "peter@example.com", phone: "+256700000012", nin: "CM90100012349E" },
    { name: "Mary Auma", email: "mary@example.com", phone: "+256700000013", nin: "CM90100012350F" },
    { name: "David Ssali", email: "david@example.com", phone: "+256700000014", nin: "CM90100012351G" },
  ];
  const users = [];
  for (const u of userDefs) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: { ...u, passwordHash: userHash, role: "PUBLIC_USER" },
    });
    users.push(user);
  }

  // ========== REFERENCE DATA ==========
  console.log("📍 Seeding Reference Data...");

  // Regions
  const regions = [
    { name: "Central", description: "Central Region of Uganda including Kampala" },
    { name: "Eastern", description: "Eastern Region including Jinja, Bugiri" },
    { name: "Western", description: "Western Region including Mbarara, Kasese" },
    { name: "Northern", description: "Northern Region including Gulu, Lira" },
  ];
  for (const r of regions) {
    await prisma.region.upsert({ where: { name: r.name }, update: {}, create: r });
  }

  // Districts
  const districts = [
    { name: "Kampala", region: "Central" },
    { name: "Wakiso", region: "Central" },
    { name: "Mukono", region: "Central" },
    { name: "Jinja", region: "Eastern" },
    { name: "Entebbe", region: "Central" },
    { name: "Gulu", region: "Northern" },
    { name: "Mbarara", region: "Western" },
    { name: "Mbale", region: "Eastern" },
    { name: "Lira", region: "Northern" },
    { name: "Masaka", region: "Central" },
    { name: "Soroti", region: "Eastern" },
    { name: "Arua", region: "Northern" },
    { name: "Fort Portal", region: "Western" },
    { name: "Kabale", region: "Western" },
    { name: "Hoima", region: "Western" },
    { name: "Masindi", region: "Western" },
    { name: "Tororo", region: "Eastern" },
    { name: "Iganga", region: "Eastern" },
    { name: "Busia", region: "Eastern" },
    { name: "Kasese", region: "Western" },
  ];
  for (const d of districts) {
    await prisma.district.upsert({ where: { name: d.name }, update: {}, create: d });
  }

  // Counties (sample per district)
  const counties = [
    { name: "Kampala Central", district: "Kampala", region: "Central" },
    { name: "Kawempe", district: "Kampala", region: "Central" },
    { name: "Nakawa", district: "Kampala", region: "Central" },
    { name: "Rubaga", district: "Kampala", region: "Central" },
    { name: "Makindye", district: "Kampala", region: "Central" },
    { name: "Wakiso North", district: "Wakiso", region: "Central" },
    { name: "Wakiso South", district: "Wakiso", region: "Central" },
    { name: "Mukono", district: "Mukono", region: "Central" },
    { name: "Jinja Central", district: "Jinja", region: "Eastern" },
    { name: "Gulu", district: "Gulu", region: "Northern" },
    { name: "Mbarara Central", district: "Mbarara", region: "Western" },
    { name: "Mbale Central", district: "Mbale", region: "Eastern" },
  ];
  for (const c of counties) {
    await prisma.county.upsert({ where: { name_district: { name: c.name, district: c.district } }, update: {}, create: c });
  }

  // Subcounties (sample)
  const subcounties = [
    { name: "Kisasi", county: "Kampala Central", district: "Kampala" },
    { name: "Nakasero", county: "Kampala Central", district: "Kampala" },
    { name: "Kololo", county: "Kampala Central", district: "Kampala" },
    { name: "Najjera", county: "Kawempe", district: "Kampala" },
    { name: "Bweyogerere", county: "Kawempe", district: "Kampala" },
    { name: "Seeta", county: "Mukono", district: "Mukono" },
    { name: "Bugembe", county: "Jinja Central", district: "Jinja" },
    { name: "Masese", county: "Jinja Central", district: "Jinja" },
    { name: "Pajule", county: "Gulu", district: "Gulu" },
    { name: "Lalogi", county: "Gulu", district: "Gulu" },
  ];
  for (const s of subcounties) {
    await prisma.subcounty.upsert({ where: { name_county_district: { name: s.name, county: s.county, district: s.district } }, update: {}, create: s });
  }

  // Streets/Villages (sample) - use createMany with skipDuplicates
  const streets = [
    { name: "Kampala Road", subcounty: "Kampala Central", district: "Kampala", region: "Central" },
    { name: "Entebbe Road", subcounty: "Kampala Central", district: "Kampala", region: "Central" },
    { name: "Mubende Road", subcounty: "Kampala Central", district: "Kampala", region: "Central" },
    { name: "Jinja Road", subcounty: "Kampala Central", district: "Kampala", region: "Central" },
    { name: "Luweero Road", subcounty: "Kawempe", district: "Kampala", region: "Central" },
    { name: "Kafumba Road", subcounty: "Kawempe", district: "Kampala", region: "Central" },
    { name: "Buganda Road", subcounty: "Nakawa", district: "Kampala", region: "Central" },
    { name: "Portbell Road", subcounty: "Nakawa", district: "Kampala", region: "Central" },
    { name: "Old Ferry Road", subcounty: "Mukono", district: "Mukono", region: "Central" },
    { name: "Gulu Road Main", subcounty: "Gulu", district: "Gulu", region: "Northern" },
  ];
  for (const st of streets) {
    const key = st.name.replace(/\s+/g, "-").toLowerCase() + "-" + st.district.replace(/\s+/g, "-").toLowerCase();
    await prisma.street.upsert({ 
      where: { name_district: { name: st.name, district: st.district } }, 
      update: {}, 
      create: { name: st.name, subcounty: st.subcounty, district: st.district, region: st.region } 
    });
  }

  // Main Roads
  const roads = [
    { name: "Kampala-Jinja Highway", district: "Kampala", region: "Central" },
    { name: "Kampala-Masindi Highway", district: "Kampala", region: "Central" },
    { name: "Kampala-Gulu Highway", district: "Kampala", region: "Central" },
    { name: "Kampala-Mbarara Highway", district: "Kampala", region: "Central" },
    { name: "Kampala-Busembatia Road", district: "Wakiso", region: "Central" },
    { name: "Jinja-Mbale Road", district: "Jinja", region: "Eastern" },
    { name: "Gulu-Nimule Road", district: "Gulu", region: "Northern" },
  ];
  for (const r of roads) {
    await prisma.mainRoad.upsert({ where: { name: r.name }, update: {}, create: r });
  }

  // Property Categories
  const categories = [
    { name: "Residential", slug: "residential", description: "Residential properties" },
    { name: "Commercial", slug: "commercial", description: "Commercial properties" },
    { name: "Agricultural", slug: "agricultural", description: "Agricultural land" },
    { name: "Industrial", slug: "industrial", description: "Industrial properties" },
    { name: "Mixed Use", slug: "mixed-use", description: "Mixed use properties" },
  ];
  for (const c of categories) {
    await prisma.propertyCategory.upsert({ where: { name: c.name }, update: {}, create: c });
  }

  // Tenure Types
  const tenures = [
    { name: "Freehold", code: "FREEHOLD", description: "Freehold tenure" },
    { name: "Mailo", code: "MAILO", description: "Mailo tenure (Buganda)" },
    { name: "Kibanja", code: "KIBANJA", description: "Kibanja tenure" },
    { name: "Leasedhold", code: "LEASEHOLD", description: "Leasehold tenure" },
    { name: "Titled", code: "TITLED", description: "Titled land" },
  ];
  for (const t of tenures) {
    await prisma.tenureType.upsert({ where: { name: t.name }, update: {}, create: t });
  }

  console.log("✅ Reference data seeded!");

  // Properties
  const propertiesData = [
    {
      plotNumber: "KLA-001-2024",
      title: "Residential Plot in Kololo",
      description: "Prime residential plot in the heart of Kololo, Kampala. Fully titled with all utilities.",
      district: "Kampala",
      county: "Kampala Central",
      subcounty: "Kololo",
      village: "Kololo Hill",
      address: "Plot 12, Kololo Hill Drive",
      size: 0.25,
      sizeUnit: "acres",
      tenure: "TITLED" as const,
      type: "RESIDENTIAL" as const,
      status: "ACTIVE" as const,
      price: 450000000,
      latitude: 0.3476,
      longitude: 32.5825,
      isFeatured: true,
      isPublicListing: true,
    },
    {
      plotNumber: "WKS-002-2024",
      title: "Mailo Land in Wakiso",
      description: "Large mailo land parcel suitable for residential development in Wakiso district.",
      district: "Wakiso",
      county: "Busiro",
      subcounty: "Nansana",
      village: "Nansana East",
      address: "Nansana-Gombe Road",
      size: 1.5,
      sizeUnit: "acres",
      tenure: "MAILO" as const,
      type: "RESIDENTIAL" as const,
      status: "ACTIVE" as const,
      price: 180000000,
      latitude: 0.3653,
      longitude: 32.5217,
      isFeatured: true,
      isPublicListing: true,
    },
    {
      plotNumber: "MKN-003-2024",
      title: "Commercial Plot in Mukono Town",
      description: "Strategic commercial plot along Mukono-Jinja highway. Ideal for retail or office development.",
      district: "Mukono",
      county: "Mukono",
      subcounty: "Mukono Town",
      village: "Mukono Central",
      address: "Kampala-Jinja Highway, Mukono",
      size: 0.5,
      sizeUnit: "acres",
      tenure: "FREEHOLD" as const,
      type: "COMMERCIAL" as const,
      status: "ACTIVE" as const,
      price: 320000000,
      latitude: 0.3535,
      longitude: 32.7553,
      isFeatured: true,
      isPublicListing: true,
    },
    {
      plotNumber: "JJA-004-2024",
      title: "Agricultural Land in Jinja",
      description: "Fertile agricultural land near River Nile. Suitable for farming and agribusiness.",
      district: "Jinja",
      county: "Jinja",
      subcounty: "Butembe",
      village: "Butembe",
      address: "Butembe, Jinja",
      size: 5.0,
      sizeUnit: "acres",
      tenure: "LEASEHOLD" as const,
      type: "AGRICULTURAL" as const,
      status: "ACTIVE" as const,
      price: 95000000,
      latitude: 0.4478,
      longitude: 33.2026,
      isFeatured: false,
      isPublicListing: true,
    },
    {
      plotNumber: "KLA-005-2024",
      title: "Kibanja Land in Rubaga",
      description: "Kibanja land in Rubaga division with existing structure. Good for residential use.",
      district: "Kampala",
      county: "Rubaga",
      subcounty: "Rubaga",
      village: "Namirembe",
      address: "Namirembe Road, Rubaga",
      size: 0.1,
      sizeUnit: "acres",
      tenure: "KIBANJA" as const,
      type: "RESIDENTIAL" as const,
      status: "PENDING_APPROVAL" as const,
      price: 85000000,
      latitude: 0.3136,
      longitude: 32.5522,
      isFeatured: false,
      isPublicListing: false,
    },
    {
      plotNumber: "WKS-006-2024",
      title: "Industrial Plot in Namanve",
      description: "Industrial plot in Namanve Industrial Park. Fully serviced with power and water.",
      district: "Wakiso",
      county: "Kyaggwe",
      subcounty: "Namanve",
      village: "Namanve",
      address: "Namanve Industrial Park",
      size: 2.0,
      sizeUnit: "acres",
      tenure: "LEASEHOLD" as const,
      type: "INDUSTRIAL" as const,
      status: "ACTIVE" as const,
      price: 750000000,
      latitude: 0.3167,
      longitude: 32.7167,
      isFeatured: false,
      isPublicListing: true,
    },
    {
      plotNumber: "KLA-007-2024",
      title: "Mixed Use Plot in Ntinda",
      description: "Mixed use plot in Ntinda, suitable for commercial ground floor and residential upper floors.",
      district: "Kampala",
      county: "Nakawa",
      subcounty: "Ntinda",
      village: "Ntinda",
      address: "Ntinda Road, Kampala",
      size: 0.3,
      sizeUnit: "acres",
      tenure: "TITLED" as const,
      type: "OTHER" as const,
      status: "ACTIVE" as const,
      price: 520000000,
      latitude: 0.3467,
      longitude: 32.6167,
      isFeatured: false,
      isPublicListing: true,
    },
    {
      plotNumber: "MKN-008-2024",
      title: "Residential Land in Seeta",
      description: "Quiet residential land in Seeta, Mukono. Close to schools and shopping centres.",
      district: "Mukono",
      county: "Mukono",
      subcounty: "Seeta",
      village: "Seeta",
      address: "Seeta-Mukono Road",
      size: 0.4,
      sizeUnit: "acres",
      tenure: "MAILO" as const,
      type: "RESIDENTIAL" as const,
      status: "ACTIVE" as const,
      price: 120000000,
      latitude: 0.3333,
      longitude: 32.6833,
      isFeatured: false,
      isPublicListing: true,
    },
    {
      plotNumber: "JJA-009-2024",
      title: "Commercial Plot in Jinja Town",
      description: "Prime commercial plot in Jinja town centre. High foot traffic area.",
      district: "Jinja",
      county: "Jinja",
      subcounty: "Jinja Central",
      village: "Jinja Town",
      address: "Main Street, Jinja",
      size: 0.2,
      sizeUnit: "acres",
      tenure: "FREEHOLD" as const,
      type: "COMMERCIAL" as const,
      status: "DISPUTED" as const,
      price: 280000000,
      latitude: 0.4244,
      longitude: 33.2041,
      isFeatured: false,
      isPublicListing: false,
    },
    {
      plotNumber: "WKS-010-2024",
      title: "Residential Plot in Entebbe",
      description: "Beautiful residential plot near Lake Victoria in Entebbe. Serene environment.",
      district: "Wakiso",
      county: "Busiro",
      subcounty: "Entebbe",
      village: "Entebbe",
      address: "Entebbe Road",
      size: 0.35,
      sizeUnit: "acres",
      tenure: "TITLED" as const,
      type: "RESIDENTIAL" as const,
      status: "ACTIVE" as const,
      price: 380000000,
      latitude: 0.0512,
      longitude: 32.4637,
      isFeatured: false,
      isPublicListing: true,
    },
  ];

  const properties = [];
  for (const p of propertiesData) {
    const prop = await prisma.property.upsert({
      where: { plotNumber: p.plotNumber },
      update: {},
      create: p as any,
    });
    properties.push(prop);
  }

  // Assign owners to properties
  const ownerAssignments = [
    { propertyIdx: 0, userIdx: 0, share: 100, isPrimary: true },
    { propertyIdx: 1, userIdx: 1, share: 60, isPrimary: true },
    { propertyIdx: 1, userIdx: 2, share: 40, isPrimary: false },
    { propertyIdx: 2, userIdx: 2, share: 100, isPrimary: true },
    { propertyIdx: 3, userIdx: 3, share: 100, isPrimary: true },
    { propertyIdx: 4, userIdx: 4, share: 100, isPrimary: true },
    { propertyIdx: 5, userIdx: 0, share: 100, isPrimary: true },
    { propertyIdx: 6, userIdx: 1, share: 100, isPrimary: true },
    { propertyIdx: 7, userIdx: 2, share: 100, isPrimary: true },
    { propertyIdx: 8, userIdx: 3, share: 100, isPrimary: true },
    { propertyIdx: 9, userIdx: 4, share: 100, isPrimary: true },
  ];

  for (const a of ownerAssignments) {
    await prisma.propertyOwner.upsert({
      where: {
        propertyId_userId_isActive: {
          propertyId: properties[a.propertyIdx].id,
          userId: users[a.userIdx].id,
          isActive: true,
        },
      },
      update: {},
      create: {
        propertyId: properties[a.propertyIdx].id,
        userId: users[a.userIdx].id,
        sharePercentage: a.share,
        isPrimary: a.isPrimary,
        isActive: true,
      },
    });
  }

  // Valuation for property 0
  const valuation = await prisma.valuation.create({
    data: {
      propertyId: properties[0].id,
      officerId: officer1.id,
      valuedAmount: 450000000,
      taxAmount: 4500000,
      taxRate: 0.01,
      notes: "Annual property tax assessment",
    },
  });

  // Tax payment
  await prisma.taxPayment.create({
    data: {
      valuationId: valuation.id,
      amount: 4500000,
      method: "BANK",
      notes: "Paid via Stanbic Bank",
    },
  });

  // Transactions
  const txStatuses = ["INITIATED", "UNDER_REVIEW", "APPROVED", "COMPLETED", "REJECTED"] as const;
  const txTypes = ["SALE", "LEASE", "TRANSFER", "MORTGAGE"] as const;
  const txAmounts = [280000000, 450000000, 320000000, 150000000, 550000000, 180000000, 380000000];
  const txNotes = [
    "Transaction pending verification of ownership documents.",
    "Lease agreement for 5 years with annual renewal option.",
    "Transfer initiated by legal representative.",
    "Mortgage application submitted to Stanbic Bank.",
    "Full payment received and verified.",
    "Transaction stalled pending survey confirmation.",
  ];

  for (let i = 0; i < 7; i++) {
    const propIdx = i % Math.min(properties.length, 10);
    const buyerIdx = (i + 1) % users.length;
    const sellerIdx = i % users.length;
    const statusIdx = i % txStatuses.length;
    await prisma.transaction.create({
      data: {
        propertyId: properties[propIdx].id,
        type: txTypes[i % txTypes.length],
        status: txStatuses[statusIdx],
        initiatedById: officer1.id,
        buyerId: users[buyerIdx].id,
        sellerId: users[sellerIdx].id,
        amount: txAmounts[i],
        currency: "UGX",
        agreementDate: new Date(2024, i % 12, 1 + (i * 3) % 28),
        completedDate: txStatuses[statusIdx] === "COMPLETED" ? new Date(2024, i % 12, 15 + (i * 5) % 15) : null,
        notes: txNotes[i % txNotes.length],
      },
    });
  }

  // Dispute for property 8
  const dispute = await prisma.dispute.create({
    data: {
      propertyId: properties[8].id,
      complainantId: users[3].id,
      title: "Boundary Encroachment",
      description: "Complainant alleges that the registered owner has encroached on their adjacent land by 5 metres.",
      status: "UNDER_INVESTIGATION",
    },
  });

  await prisma.disputeNote.create({
    data: {
      disputeId: dispute.id,
      note: "Site visit conducted. Survey team dispatched to verify boundary marks.",
      addedById: officer2.id,
    },
  });

  // Audit log entries
  await prisma.auditLog.createMany({
    data: [
      {
        actorId: admin.id,
        action: "CREATE",
        entityType: "Property",
        entityId: properties[0].id,
        propertyId: properties[0].id,
        newValue: { plotNumber: properties[0].plotNumber },
      },
      {
        actorId: officer1.id,
        action: "APPROVE",
        entityType: "Property",
        entityId: properties[0].id,
        propertyId: properties[0].id,
        newValue: { status: "ACTIVE" },
      },
      {
        actorId: officer1.id,
        action: "CREATE",
        entityType: "Transaction",
        entityId: "tx-001",
        newValue: { type: "SALE", amount: 320000000 },
      },
    ],
  });

  console.log("✅ Seed complete!");
  console.log("   Admin:   admin@demoproperties.ug / admin123");
  console.log("   Officer: officer1@demoproperties.ug / officer123");
  console.log("   User:    james@example.com / user123");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
