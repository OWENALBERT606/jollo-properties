import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import { db } from "@/prisma/db";
import { hash } from "bcryptjs";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "LAND_OFFICER" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const { password, ...data } = body;
  const updateData: any = { ...data };
  if (password) updateData.passwordHash = await hash(password, 12);

  const user = await db.user.update({ where: { id: params.id }, data: updateData });
  await db.auditLog.create({
    data: { actorId: session.user.id, action: "UPDATE", entityType: "User", entityId: params.id, newValue: data },
  });
  return NextResponse.json(user);
}
