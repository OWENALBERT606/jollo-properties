import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import { requireAdmin } from "@/lib/auth-guard";
import { db } from "@/prisma/db";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const item = await db.document.findUnique({
    where: { id: (await params).id },
    include: {
      property: { select: { id: true, plotNumber: true, title: true } },
      uploadedBy: { select: { id: true, name: true, email: true } },
    },
  });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const guard = requireAdmin(session);
  if (guard) return guard;

  try {
    const body = await req.json();
    const updateData: any = {};
    if (body.name) updateData.name = body.name;
    if (body.type) updateData.type = body.type;

    const item = await db.document.update({ where: { id: (await params).id }, data: updateData });
    return NextResponse.json(item);
  } catch (err: any) {
    if (err.code === "P2025") return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const guard = requireAdmin(session);
  if (guard) return guard;

  try {
    const doc = await db.document.findUnique({ where: { id: (await params).id } });
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Note: In production, also delete the file from R2 here
    await db.document.delete({ where: { id: (await params).id } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err.code === "P2025") return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}