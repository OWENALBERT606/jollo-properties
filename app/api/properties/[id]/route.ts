import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import { db } from "@/prisma/db";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "LAND_OFFICER")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const property = await db.property.update({ where: { id: (await params).id }, data: body });
  await db.auditLog.create({
    data: { actorId: session.user.id, action: "UPDATE", entityType: "Property", entityId: (await params).id, propertyId: (await params).id, newValue: body },
  });
  return NextResponse.json(property);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await db.property.delete({ where: { id: (await params).id } });
  return NextResponse.json({ success: true });
}
