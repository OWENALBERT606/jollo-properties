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
  const transactionId = searchParams.get("transactionId");

  const where: any = {};
  if (propertyId) where.propertyId = propertyId;
  if (transactionId) where.transactionId = transactionId;

  const data = await db.workflowStep.findMany({
    where,
    orderBy: { createdAt: "asc" },
    include: {
      property: { select: { id: true, plotNumber: true, title: true } },
      transaction: { select: { id: true, type: true, status: true } },
      assignee: { select: { id: true, name: true } },
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
    if (!body.stepName?.trim()) return NextResponse.json({ error: "Step name is required" }, { status: 400 });

    if (!body.propertyId && !body.transactionId) {
      return NextResponse.json({ error: "Property or transaction is required" }, { status: 400 });
    }

    const item = await db.workflowStep.create({
      data: {
        propertyId: body.propertyId || null,
        transactionId: body.transactionId || null,
        stepName: body.stepName.trim(),
        assigneeId: body.assigneeId || null,
        notes: body.notes || null,
      },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}