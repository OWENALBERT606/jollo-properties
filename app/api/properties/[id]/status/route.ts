import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import { db } from "@/prisma/db";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { status } = await req.json();
  const property = await db.property.update({
    where: { id: params.id },
    data: { status },
  });
  await db.auditLog.create({
    data: {
      actorId: session.user.id,
      action: status === "ACTIVE" ? "APPROVE" : "REJECT",
      entityType: "Property",
      entityId: params.id,
      propertyId: params.id,
      newValue: { status },
    },
  });
  return NextResponse.json(property);
}
