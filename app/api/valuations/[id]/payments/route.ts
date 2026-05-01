import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import { db } from "@/prisma/db";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  await db.taxPayment.create({
    data: { valuationId: (await params).id, amount: Number(body.amount), method: body.method, notes: body.notes },
  });

  const updated = await db.valuation.findUnique({
    where: { id: (await params).id },
    include: { property: { select: { title: true, plotNumber: true, district: true } }, officer: { select: { name: true } }, payments: true },
  });
  return NextResponse.json(updated);
}
