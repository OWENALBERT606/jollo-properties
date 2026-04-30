import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import { db } from "@/prisma/db";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const note = await db.disputeNote.findUnique({ where: { id: params.id } });
    if (!note) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Only author can edit within 1 hour
    if (note.addedById !== session.user.id) {
      return NextResponse.json({ error: "You can only edit your own notes" }, { status: 403 });
    }
    
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
    if (note.createdAt < hourAgo) {
      return NextResponse.json({ error: "Notes can only be edited within 1 hour" }, { status: 400 });
    }

    const item = await db.disputeNote.update({
      where: { id: params.id },
      data: { note: body.note?.trim() },
    });
    return NextResponse.json(item);
  } catch (err: any) {
    if (err.code === "P2025") return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const note = await db.disputeNote.findUnique({ where: { id: params.id } });
    if (!note) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Author or admin can delete
    if (note.addedById !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    await db.disputeNote.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err.code === "P2025") return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}