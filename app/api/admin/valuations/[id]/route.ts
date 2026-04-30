import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import { requireOfficer } from "@/lib/auth-guard";
import { db } from "@/prisma/db";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const item = await db.valuation.findUnique({
    where: { id: params.id },
    include: {
      property: { select: { id: true, plotNumber: true, title: true, district: true } },
      officer: { select: { id: true, name: true, email: true } },
      payments: { orderBy: { paidAt: "desc" } },
    },
  });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const guard = requireOfficer(session);
  if (guard) return guard;

  try {
    const body = await req.json();
    const updateData: any = {};

    if (body.notes !== undefined) updateData.notes = body.notes;
    
    // Recalculate tax if rate or amount changed
    if (body.valuedAmount || body.taxRate) {
      const current = await db.valuation.findUnique({ where: { id: params.id } });
      const valuedAmount = parseFloat(body.valuedAmount) || Number(current.valuedAmount);
      const taxRate = parseFloat(body.taxRate) || Number(current.taxRate);
      updateData.valuedAmount = valuedAmount;
      updateData.taxRate = taxRate;
      updateData.taxAmount = valuedAmount * (taxRate / 100);
    }

    const item = await db.valuation.update({ where: { id: params.id }, data: updateData });
    return NextResponse.json(item);
  } catch (err: any) {
    if (err.code === "P2025") return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const guard = requireOfficer(session);
  if (guard) return guard;

  try {
    // Check for linked payments
    const payments = await db.taxPayment.count({ where: { valuationId: params.id } });
    if (payments > 0) return NextResponse.json({ error: "Cannot delete: payments linked to this valuation" }, { status: 400 });

    await db.valuation.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err.code === "P2025") return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}