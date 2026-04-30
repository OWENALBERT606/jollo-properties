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
  const status = searchParams.get("status");
  const buyerId = searchParams.get("buyerId");
  const sellerId = searchParams.get("sellerId");

  const where: any = {};
  if (propertyId) where.propertyId = propertyId;
  if (type) where.type = type;
  if (status) where.status = status;
  if (buyerId) where.buyerId = buyerId;
  if (sellerId) where.sellerId = sellerId;

  // Users can see their own transactions
  if (!session.user.role || session.user.role === "PUBLIC_USER") {
    where.OR = [
      { buyerId: session.user.id },
      { sellerId: session.user.id },
      { initiatedById: session.user.id },
    ];
  }

  const data = await db.transaction.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      property: { select: { id: true, plotNumber: true, title: true, district: true } },
      initiatedBy: { select: { id: true, name: true } },
      buyer: { select: { id: true, name: true } },
      seller: { select: { id: true, name: true } },
    },
  });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    if (!body.propertyId) return NextResponse.json({ error: "Property is required" }, { status: 400 });
    if (!body.type) return NextResponse.json({ error: "Transaction type is required" }, { status: 400 });

    // Verify property exists
    const property = await db.property.findUnique({ where: { id: body.propertyId } });
    if (!property) return NextResponse.json({ error: "Property not found" }, { status: 404 });

    const item = await db.transaction.create({
      data: {
        propertyId: body.propertyId,
        type: body.type,
        initiatedById: session.user.id,
        buyerId: body.buyerId || null,
        sellerId: body.sellerId || null,
        amount: body.amount || null,
        currency: body.currency || "UGX",
        agreementDate: body.agreementDate ? new Date(body.agreementDate) : null,
        notes: body.notes || null,
      },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}