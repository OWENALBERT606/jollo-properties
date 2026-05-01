const path = require('path');
const fs = require('fs');
const envFile = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envFile)) {
  for (const line of fs.readFileSync(envFile, 'utf-8').split('\n')) {
    const m = line.match(/^([^=#][^=]*)=(.*)/);
    if (m) { const k=m[1].trim(), v=m[2].trim().replace(/^["']|["']$/g,''); if(!process.env[k]) process.env[k]=v; }
  }
}
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient({ datasources: { db: { url: process.env.DIRECT_URL||process.env.DATABASE_URL } } });
async function run() {
  // Simulate exact listing page query
  const property = await db.property.findUnique({
    where: { plotNumber: 'KLA-001-2024' },
    include: {
      documents: { orderBy: { createdAt: 'desc' } },
    },
  });
  console.log('Property found:', property ? property.title : 'NOT FOUND');
  console.log('Total documents:', property?.documents?.length ?? 0);
  const photos = (property?.documents || []).filter(d => d.type === 'PHOTO');
  console.log('PHOTO documents:', photos.length);
  if (photos[0]) console.log('First photo URL:', photos[0].r2Url);
  await db.$disconnect();
}
run().catch(e => { console.error(e.message); process.exit(1); });
