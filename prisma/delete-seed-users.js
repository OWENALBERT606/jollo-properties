/**
 * One-time script to delete all seeded demo users and their associated data.
 * Run with: node prisma/delete-seed-users.js
 */
const path = require("path");
const fs = require("fs");

// Load .env manually
const envFile = path.resolve(process.cwd(), ".env");
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, "utf-8").split("\n")) {
    const m = line.match(/^([^=#][^=]*)=(.*)/);
    if (m) {
      const k = m[1].trim(), v = m[2].trim().replace(/^["']|["']$/g, "");
      if (!process.env[k]) process.env[k] = v;
    }
  }
}

const { PrismaClient } = require("@prisma/client");
const db = new PrismaClient({ datasources: { db: { url: process.env.DIRECT_URL || process.env.DATABASE_URL } } });

const SEED_EMAILS = [
  "admin@demoproperties.ug",
  "officer1@demoproperties.ug",
  "officer2@demoproperties.ug",
  "james@example.com",
  "sarah@example.com",
  "peter@example.com",
  "mary@example.com",
  "david@example.com",
];

async function run() {
  const users = await db.user.findMany({ where: { email: { in: SEED_EMAILS } }, select: { id: true, email: true } });
  if (!users.length) { console.log("No seed users found."); await db.$disconnect(); return; }

  console.log(`Found ${users.length} seed users:`, users.map((u) => u.email).join(", "));
  const ids = users.map((u) => u.id);

  // Null out optional FK columns that don't cascade
  await db.transaction.updateMany({ where: { buyerId: { in: ids } }, data: { buyerId: null } });
  await db.transaction.updateMany({ where: { sellerId: { in: ids } }, data: { sellerId: null } });
  await db.workflowStep.updateMany({ where: { assigneeId: { in: ids } }, data: { assigneeId: null } });
  console.log("Cleared optional FK references.");

  // Delete transactions initiated by seed users (non-nullable initiatedById)
  const txCount = await db.transaction.deleteMany({ where: { initiatedById: { in: ids } } });
  console.log(`Deleted ${txCount.count} transactions initiated by seed users.`);

  // Delete dispute notes added by seed users
  const noteCount = await db.disputeNote.deleteMany({ where: { addedById: { in: ids } } });
  console.log(`Deleted ${noteCount.count} dispute notes.`);

  // Delete tax payments linked to valuations that belong to seed users
  const seedValuations = await db.valuation.findMany({ where: { officerId: { in: ids } }, select: { id: true } });
  const seedValIds = seedValuations.map((v) => v.id);
  if (seedValIds.length) {
    const taxCount = await db.taxPayment.deleteMany({ where: { valuationId: { in: seedValIds } } });
    console.log(`Deleted ${taxCount.count} tax payments.`);
  }

  // Delete valuations where officer is a seed user
  const valCount = await db.valuation.deleteMany({ where: { officerId: { in: ids } } });
  console.log(`Deleted ${valCount.count} valuations.`);

  // Delete disputes filed by seed users (+ their notes cascade)
  const dispCount = await db.dispute.deleteMany({ where: { complainantId: { in: ids } } });
  console.log(`Deleted ${dispCount.count} disputes.`);

  // Delete documents uploaded by seed users
  const docCount = await db.document.deleteMany({ where: { uploadedById: { in: ids } } });
  console.log(`Deleted ${docCount.count} documents.`);

  // Delete workflow steps where actor is a seed user
  try {
    await db.workflowStep.deleteMany({ where: { actedById: { in: ids } } });
  } catch { /* field may not exist */ }

  // Now delete the users (cascades handle: PropertyOwner, AuditLog, sessions, accounts)
  const deleted = await db.user.deleteMany({ where: { id: { in: ids } } });
  console.log(`Deleted ${deleted.count} seed users.`);
  console.log("Done.");
  await db.$disconnect();
}

run().catch((e) => { console.error(e.message); process.exit(1); });
