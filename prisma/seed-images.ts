import { PrismaClient, DocumentType, PropertyType } from "@prisma/client";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import * as fs from "fs";
import * as path from "path";

// Load .env without requiring the dotenv package
const envFile = path.resolve(process.cwd(), ".env");
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, "utf-8").split("\n")) {
    const m = line.match(/^([^=\s#][^=]*)=(.*)$/);
    if (m) {
      const key = m[1].trim();
      const val = m[2].trim().replace(/^(["'])(.*)\1$/, "$2");
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DIRECT_URL || process.env.DATABASE_URL } },
});

const r2 = new S3Client({
  region: "auto",
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.CLOUDFLARE_R2_BUCKET_NAME!;
const PUBLIC_URL = process.env.CLOUDFLARE_R2_PUBLIC_URL!;

// Curated Unsplash photo IDs per property category.
// These are hand-picked, royalty-free photos from unsplash.com.
const PHOTO_IDS: Record<string, string[]> = {
  [PropertyType.RESIDENTIAL]: [
    "photo-1558618666-fcd25c85cd64", // green suburban plot
    "photo-1560518883-ce09059eeffa", // aerial neighbourhood
    "photo-1582407947304-fd86f028f716", // open residential land
    "photo-1560184897-ae75f418493e", // sunny plot
    "photo-1564013799919-ab600027ffc6", // land with fence
  ],
  [PropertyType.HOUSE]: [
    "photo-1580587771525-78b9dba3b914", // modern home
    "photo-1568605114967-8130f3a36994", // house exterior
    "photo-1512917774080-9991f1c4c750", // luxury house
    "photo-1570129477492-45c003edd2be", // house with garden
    "photo-1613977257592-4a9a32f9141e", // contemporary house
  ],
  [PropertyType.COMMERCIAL]: [
    "photo-1486406146926-c627a92ad1ab", // glass office building
    "photo-1497366216548-37526070297c", // modern office
    "photo-1577415124269-fc1140a69e91", // commercial block
    "photo-1460472178825-e5240623afd5", // urban commercial
    "photo-1444653614773-995cb1ef9efa", // retail building
  ],
  [PropertyType.AGRICULTURAL]: [
    "photo-1500382017468-9049fed747ef", // green farmland
    "photo-1464226184884-fa280b87c399", // open farm field
    "photo-1625246333195-78d9c38ad449", // farm landscape
    "photo-1560493676-04071c5f467b", // maize/crop field
    "photo-1500651230702-0e2d8a49d4e6", // fertile land
  ],
  [PropertyType.INDUSTRIAL]: [
    "photo-1565193566173-7a0ee3dbe261", // industrial facility
    "photo-1504328345606-18bbc8c9d7d1", // warehouse
    "photo-1581244277943-fe4a9c777189", // industrial park
    "photo-1513828583688-c52646db42da", // factory exterior
    "photo-1558346490-a72e53ae2d4f", // industrial building
  ],
  [PropertyType.MIXED_USE]: [
    "photo-1486325212027-8081e485255e", // city block
    "photo-1516026672322-bc52d61a55d5", // urban mixed
    "photo-1477959858617-67f85cf4f1df", // urban cityscape
    "photo-1449824913935-59a10b8d2000", // city building
    "photo-1519501025264-65ba15a82390", // urban scene
  ],
  [PropertyType.LAND]: [
    "photo-1472214103451-9374bd1c798e", // open landscape
    "photo-1500534314209-a25ddb2bd429", // scenic land
    "photo-1433086966358-54859d0ed716", // green land
    "photo-1441974231531-c6227db76b6e", // nature land
    "photo-1534067783941-51c9c23ecefd", // tropical land
  ],
  OTHER: [
    "photo-1486325212027-8081e485255e",
    "photo-1560518883-ce09059eeffa",
    "photo-1558618666-fcd25c85cd64",
  ],
};

async function fetchImage(photoId: string): Promise<{ buffer: Buffer; contentType: string }> {
  const url = `https://images.unsplash.com/${photoId}?w=1200&h=800&fit=crop&q=80&fm=jpg`;
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; jollo-seed/1.0)" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${photoId}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  return { buffer, contentType: "image/jpeg" };
}

async function uploadToR2(
  buffer: Buffer,
  contentType: string,
  propertyId: string
): Promise<{ key: string; r2Url: string }> {
  const key = `properties/${propertyId}/${randomUUID()}.jpg`;
  await r2.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })
  );
  return { key, r2Url: `${PUBLIC_URL}/${key}` };
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  console.log("🖼️  Seeding property images into Cloudflare R2...\n");

  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (!admin) throw new Error("No ADMIN user found — run the main seed first.");

  const properties = await prisma.property.findMany({
    include: { documents: { where: { type: DocumentType.PHOTO } } },
    orderBy: { createdAt: "asc" },
  });

  console.log(`Found ${properties.length} properties\n`);

  let uploaded = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < properties.length; i++) {
    const property = properties[i];

    if (property.documents.length >= 3) {
      console.log(`⏭️  [${i + 1}/${properties.length}] ${property.plotNumber} — already has photos, skipping`);
      skipped++;
      continue;
    }

    const existingCount = property.documents.length;
    const needed = 3 - existingCount;
    const typeKey = (property.type as PropertyType) in PHOTO_IDS ? property.type : "OTHER";
    const pool = PHOTO_IDS[typeKey] ?? PHOTO_IDS.OTHER;

    console.log(`📸 [${i + 1}/${properties.length}] ${property.plotNumber}: ${property.title}`);

    for (let j = existingCount; j < existingCount + needed; j++) {
      const photoId = pool[j % pool.length];
      try {
        const { buffer, contentType } = await fetchImage(photoId);
        const { key, r2Url } = await uploadToR2(buffer, contentType, property.id);

        await prisma.document.create({
          data: {
            propertyId: property.id,
            uploadedById: admin.id,
            name: `${property.title} — Photo ${j + 1}`,
            type: DocumentType.PHOTO,
            r2Key: key,
            r2Url,
            mimeType: contentType,
            sizeBytes: buffer.length,
          },
        });

        console.log(`   ✅ Photo ${j + 1} → ${r2Url}`);
        uploaded++;
        await sleep(400); // be polite to Unsplash CDN
      } catch (err) {
        console.error(`   ❌ Photo ${j + 1} failed: ${err}`);
        failed++;
      }
    }
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`✅ Done!`);
  console.log(`   Uploaded : ${uploaded} photos`);
  console.log(`   Skipped  : ${skipped} properties`);
  console.log(`   Failed   : ${failed} photos`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
