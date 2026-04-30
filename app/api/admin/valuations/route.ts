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

  const where: any = {};
  if (propertyId) where.propertyId = propertyId;

  const data = await db.valuation.findMany({
    where,
    orderBy: { valuationDate: "desc" },
    include: {
      property: { select: { id: true, plotNumber: true, title: true, district: true } },
      officer: { select: { id: true, name: true } },
      _count: { select: { payments: true } },
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
    if (!body.valuedAmount) return NextResponse.json({ error: "Valued amount is required" }, { status: 400 });
    if (!body.taxRate && body.taxRate !== 0) return NextResponse.json({ error: "Tax rate is required" }, { status: 400 });

    const taxRate = parseFloat(body.taxRate);
    const valuedAmount = parseFloat(body.valuedAmount);
    const taxAmount = valuedAmount * (taxRate / 100);

    const item = await db.valuation.create({
      data: {
        propertyId: body.propertyId,
        officerId: session.user.id,
        valuedAmount,
        taxAmount,
        taxRate,
        valuationDate: body.valuationDate ? new Date(body.valuationDate) : new Date(),
        notes: body.notes || null,
      },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}