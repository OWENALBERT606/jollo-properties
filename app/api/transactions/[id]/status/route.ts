import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import { db } from "@/prisma/db";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "LAND_OFFICER" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { status } = await req.json();
  const tx = await db.transaction.update({
    where: { id: params.id },
    data: { status, completedDate: status === "COMPLETED" ? new Date() : undefined },
    include: { property: { select: { title: true, plotNumber: true } }, buyer: { select: { name: true } }, seller: { select: { name: true } }, initiatedBy: { select: { name: true } } },
  });
  await db.auditLog.create({
    data: { actorId: session.user.id, action: status, entityType: "Transaction", entityId: params.id, transactionId: params.id, newValue: { status } },
  });
  return NextResponse.json(tx);
}
