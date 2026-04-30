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
  const userId = searchParams.get("userId");
  const isActive = searchParams.get("isActive");

  const where: any = {};
  if (propertyId) where.propertyId = propertyId;
  if (userId) where.userId = userId;
  if (isActive !== null) where.isActive = isActive !== "false";

  const data = await db.propertyOwner.findMany({
    where,
    orderBy: { startDate: "desc" },
    include: {
      property: { select: { id: true, plotNumber: true, title: true } },
      user: { select: { id: true, name: true, email: true, phone: true } },
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
    if (!body.userId) return NextResponse.json({ error: "Owner (user) is required" }, { status: 400 });
    if (!body.sharePercentage) return NextResponse.json({ error: "Share percentage is required" }, { status: 400 });

    // Deactivate existing owners if setting as primary
    if (body.isPrimary) {
      await db.propertyOwner.updateMany({
        where: { propertyId: body.propertyId, isActive: true },
        data: { isPrimary: false },
      });
    }

    const item = await db.propertyOwner.create({
      data: {
        propertyId: body.propertyId,
        userId: body.userId,
        sharePercentage: body.sharePercentage,
        isPrimary: body.isPrimary || false,
        notes: body.notes || null,
      },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (err: any) {
    if (err.code === "P2002") return NextResponse.json({ error: "Owner already assigned to this property" }, { status: 409 });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}