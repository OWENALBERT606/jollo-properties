import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import { requireAdmin, requireOfficer } from "@/lib/auth-guard";
import { db } from "@/prisma/db";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const propertyId = searchParams.get("propertyId");
  const type = searchParams.get("type");

  const where: any = {};
  if (propertyId) where.propertyId = propertyId;
  if (type) where.type = type;

  const data = await db.document.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      property: { select: { id: true, plotNumber: true, title: true } },
      uploadedBy: { select: { id: true, name: true } },
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
    if (!body.propertyId) return NextResponse.json({ error: "Property is required" }, { status: 400 });
    if (!body.name?.trim()) return NextResponse.json({ error: "Document name is required" }, { status: 400 });
    if (!body.r2Key?.trim()) return NextResponse.json({ error: "File upload required" }, { status: 400 });

    // Verify property exists
    const property = await db.property.findUnique({ where: { id: body.propertyId } });
    if (!property) return NextResponse.json({ error: "Property not found" }, { status: 404 });

    const item = await db.document.create({
      data: {
        propertyId: body.propertyId,
        uploadedById: session.user.id,
        name: body.name.trim(),
        type: body.type || "OTHER",
        r2Key: body.r2Key.trim(),
        r2Url: body.r2Url?.trim() || body.r2Key.trim(),
        mimeType: body.mimeType || null,
        sizeBytes: body.sizeBytes || null,
      },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}