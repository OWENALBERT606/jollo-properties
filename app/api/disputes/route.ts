import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import { db } from "@/prisma/db";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const dispute = await db.dispute.create({
    data: { propertyId: body.propertyId, complainantId: body.complainantId, title: body.title, description: body.description },
    include: { property: { select: { title: true, plotNumber: true } }, complainant: { select: { name: true, email: true } }, notes: { include: { addedBy: { select: { name: true } } } } },
  });
  // Mark property as disputed
  await db.property.update({ where: { id: body.propertyId }, data: { status: "DISPUTED" } });
  return NextResponse.json(dispute, { status: 201 });
}
