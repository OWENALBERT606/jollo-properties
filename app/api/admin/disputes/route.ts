import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import { requireOfficer } from "@/lib/auth-guard";
import { db } from "@/prisma/db";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const propertyId = searchParams.get("propertyId");
  const status = searchParams.get("status");
  const complainantId = searchParams.get("complainantId");

  const where: any = {};
  if (propertyId) where.propertyId = propertyId;
  if (status) where.status = status;
  if (complainantId) where.complainantId = complainantId;

  // Public users see only their own disputes
  if (!session.user.role || session.user.role === "PUBLIC_USER") {
    where.complainantId = session.user.id;
  }

  const data = await db.dispute.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      property: { select: { id: true, plotNumber: true, title: true, district: true } },
      complainant: { select: { id: true, name: true, phone: true } },
      _count: { select: { notes: true } },
    },
  });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    if (!body.propertyId) return NextResponse.json({ error: "Property is required" }, { status: 400 });
    if (!body.title?.trim()) return NextResponse.json({ error: "Title is required" }, { status: 400 });
    if (!body.description?.trim()) return NextResponse.json({ error: "Description is required" }, { status: 400 });

    const item = await db.dispute.create({
      data: {
        propertyId: body.propertyId,
        complainantId: session.user.id,
        title: body.title.trim(),
        description: body.description.trim(),
      },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}