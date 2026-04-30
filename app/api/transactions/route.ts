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
  const { initiatedById, ...data } = body;

  const tx = await db.transaction.create({
    data: { ...data, initiatedById: session.user.id, amount: data.amount ? Number(data.amount) : null },
    include: { property: { select: { title: true, plotNumber: true } }, buyer: { select: { name: true } }, seller: { select: { name: true } }, initiatedBy: { select: { name: true } } },
  });

  await db.workflowStep.create({
    data: { transactionId: tx.id, stepName: "Initial Review", assigneeId: session.user.id, status: "PENDING" },
  });

  await db.auditLog.create({
    data: { actorId: session.user.id, action: "CREATE", entityType: "Transaction", entityId: tx.id, transactionId: tx.id, newValue: { type: tx.type, amount: data.amount } },
  });

  return NextResponse.json(tx, { status: 201 });
}
