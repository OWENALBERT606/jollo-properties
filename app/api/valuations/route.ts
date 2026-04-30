import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import { db } from "@/prisma/db";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "LAND_OFFICER" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const valuation = await db.valuation.create({
    data: {
      propertyId: body.propertyId,
      officerId: session.user.id,
      valuedAmount: Number(body.valuedAmount),
      taxAmount: Number(body.taxAmount),
      taxRate: Number(body.taxRate),
      notes: body.notes,
    },
    include: { property: { select: { title: true, plotNumber: true, district: true } }, officer: { select: { name: true } }, payments: true },
  });
  return NextResponse.json(valuation, { status: 201 });
}
