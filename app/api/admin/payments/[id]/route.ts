import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import { requireAdmin } from "@/lib/auth-guard";
import { db } from "@/prisma/db";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const item = await db.taxPayment.findUnique({
    where: { id: (await params).id },
    include: {
      valuation: { 
        include: { 
          property: { select: { plotNumber: true, title: true } },
          officer: { select: { name: true } },
        } 
      },
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

    if (body.method) updateData.method = body.method;
    if (body.notes !== undefined) updateData.notes = body.notes;

    const item = await db.taxPayment.update({ where: { id: (await params).id }, data: updateData });
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
    await db.taxPayment.delete({ where: { id: (await params).id } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err.code === "P2025") return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}