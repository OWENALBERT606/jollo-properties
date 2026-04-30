import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import { requireAdmin, requireOfficer } from "@/lib/auth-guard";
import { db } from "@/prisma/db";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const type = searchParams.get("type");
  const tenure = searchParams.get("tenure");
  const district = searchParams.get("district");
  const isFeatured = searchParams.get("isFeatured");
  const q = searchParams.get("q");
  const cursor = searchParams.get("cursor");

  const where: any = {};
  if (status) where.status = status;
  if (type) where.type = type;
  if (tenure) where.tenure = tenure;
  if (district) where.district = district;
  if (isFeatured === "true") where.isFeatured = true;
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { plotNumber: { contains: q, mode: "insensitive" } },
      { address: { contains: q, mode: "insensitive" } },
    ];
  }

  const data = await db.property.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 20,
    ...(cursor ? { cursor: cursor != "null" ? cursor : undefined, skip: 1 } : {}),
    include: {
      owners: { where: { isActive: true }, include: { user: { select: { name: true } } } },
      _count: { select: { documents: true, transactions: true } },
    },
  });

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const guard = requireOfficer(session);
  if (guard) return guard;

  try {
    const body = await req.json();
    if (!body.plotNumber?.trim()) return NextResponse.json({ error: "Plot number is required" }, { status: 400 });
    if (!body.title?.trim()) return NextResponse.json({ error: "Title is required" }, { status: 400 });
    if (!body.district?.trim()) return NextResponse.json({ error: "District is required" }, { status: 400 });
    if (!body.tenure) return NextResponse.json({ error: "Tenure is required" }, { status: 400 });
    if (!body.type) return NextResponse.json({ error: "Property type is required" }, { status: 400 });

    const existing = await db.property.findUnique({ where: { plotNumber: body.plotNumber } });
    if (existing) return NextResponse.json({ error: "Plot number already exists" }, { status: 409 });

    const item = await db.property.create({
      data: {
        plotNumber: body.plotNumber.trim(),
        title: body.title.trim(),
        description: body.description || null,
        district: body.district.trim(),
        county: body.county?.trim() || null,
        subcounty: body.subcounty?.trim() || null,
        village: body.village?.trim() || null,
        address: body.address?.trim() || null,
        size: body.size || 0,
        sizeUnit: body.sizeUnit || "acres",
        tenure: body.tenure,
        type: body.type,
        status: body.status || "DRAFT",
        condition: body.condition || null,
        price: body.price || null,
        latitude: body.latitude || null,
        longitude: body.longitude || null,
        isFeatured: body.isFeatured || false,
        isPublicListing: body.isPublicListing || false,
      },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}