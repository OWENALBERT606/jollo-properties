import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import { requireAdmin } from "@/lib/auth-guard";
import { db } from "@/prisma/db";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await db.propertyCategory.findUnique({ where: { id } });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const guard = requireAdmin(session);
  if (guard) return guard;

  try {
    const body = await req.json();
    const slug = body.slug?.trim() || (body.name || "").toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const item = await db.propertyCategory.update({
      where: { id },
      data: {
        name: body.name,
        slug,
        description: body.description,
        isActive: body.isActive,
      },
    });
    return NextResponse.json(item);
  } catch (err: any) {
    if (err.code === "P2025") return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const guard = requireAdmin(session);
  if (guard) return guard;

  try {
    const item = await db.propertyCategory.update({ where: { id }, data: { isActive: false } });
    return NextResponse.json(item);
  } catch (err: any) {
    if (err.code === "P2025") return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}