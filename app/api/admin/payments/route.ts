import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import { requireAdmin, requireOfficer } from "@/lib/auth-guard";
import { db } from "@/prisma/db";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const valuationId = searchParams.get("valuationId");

  const where: any = {};
  if (valuationId) where.valuationId = valuationId;

  const data = await db.taxPayment.findMany({
    where,
    orderBy: { paidAt: "desc" },
    include: {
      valuation: { 
        select: { id: true, property: { select: { plotNumber: true, title: true } } } 
      },
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
    if (!body.valuationId) return NextResponse.json({ error: "Valuation is required" }, { status: 400 });
    if (!body.amount) return NextResponse.json({ error: "Amount is required" }, { status: 400 });

    const valuation = await db.valuation.findUnique({
      where: { id: body.valuationId },
      include: { _count: { select: { payments: true } } },
    });
    if (!valuation) return NextResponse.json({ error: "Valuation not found" }, { status: 404 });

    // Generate receipt number
    const receiptNumber = `RCP-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    const item = await db.taxPayment.create({
      data: {
        valuationId: body.valuationId,
        amount: body.amount,
        receiptNumber,
        paidAt: body.paidAt ? new Date(body.paidAt) : new Date(),
        method: body.method || "CASH",
        notes: body.notes || null,
      },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}