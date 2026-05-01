import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import { db } from "@/prisma/db";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { note } = await req.json();
  const disputeNote = await db.disputeNote.create({
    data: { disputeId: (await params).id, note, addedById: session.user.id },
    include: { addedBy: { select: { name: true } } },
  });
  return NextResponse.json(disputeNote, { status: 201 });
}
