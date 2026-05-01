import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import { requireOfficer } from "@/lib/auth-guard";
import { db } from "@/prisma/db";

const statusFlow: Record<string, string[]> = {
  INITIATED: ["UNDER_REVIEW", "CANCELLED"],
  UNDER_REVIEW: ["APPROVED", "REJECTED", "CANCELLED"],
  APPROVED: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  REJECTED: ["UNDER_REVIEW"],
  CANCELLED: [],
};

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const item = await db.transaction.findUnique({
    where: { id: (await params).id },
    include: {
      property: { select: { id: true, plotNumber: true, title: true, district: true, size: true, sizeUnit: true, tenure: true } },
      initiatedBy: { select: { id: true, name: true, email: true } },
      buyer: { select: { id: true, name: true, email: true, phone: true } },
      seller: { select: { id: true, name: true, email: true, phone: true } },
      workflowSteps: { orderBy: { createdAt: "asc" }, include: { assignee: { select: { name: true } } } },
    },
  });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const guard = requireOfficer(session);
  if (guard) return guard;

  try {
    const body = await req.json();
    const current = await db.transaction.findUnique({ where: { id: (await params).id } });
    if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const updateData: any = {};

    // Status transition validation
    if (body.status) {
      const allowed = statusFlow[current.status] || [];
      if (!allowed.includes(body.status)) {
        return NextResponse.json({ error: `Cannot transition from ${current.status} to ${body.status}` }, { status: 400 });
      }
      updateData.status = body.status;
      if (body.status === "COMPLETED") {
        updateData.completedDate = new Date();
      }
    }

    if (body.buyerId) updateData.buyerId = body.buyerId;
    if (body.sellerId) updateData.sellerId = body.sellerId;
    if (body.amount) updateData.amount = body.amount;
    if (body.agreementDate) updateData.agreementDate = new Date(body.agreementDate);
    if (body.notes !== undefined) updateData.notes = body.notes;

    const item = await db.transaction.update({ where: { id: (await params).id }, data: updateData });
    return NextResponse.json(item);
  } catch (err: any) {
    if (err.code === "P2025") return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const guard = requireOfficer(session);
  if (guard) return guard;

  try {
    // Only allow cancellation (not hard delete)
    const item = await db.transaction.update({
      where: { id: (await params).id },
      data: { status: "CANCELLED" },
    });
    return NextResponse.json(item);
  } catch (err: any) {
    if (err.code === "P2025") return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}