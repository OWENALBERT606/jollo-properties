import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import { db } from "@/prisma/db";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const disputeId = searchParams.get("disputeId");

  const where: any = {};
  if (disputeId) where.disputeId = disputeId;

  const data = await db.disputeNote.findMany({
    where,
    orderBy: { createdAt: "asc" },
    include: { addedBy: { select: { id: true, name: true } } },
  });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    if (!body.disputeId) return NextResponse.json({ error: "Dispute is required" }, { status: 400 });
    if (!body.note?.trim()) return NextResponse.json({ error: "Note is required" }, { status: 400 });

    const item = await db.disputeNote.create({
      data: {
        disputeId: body.disputeId,
        note: body.note.trim(),
        addedById: session.user.id,
      },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}