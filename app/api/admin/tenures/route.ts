import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import { requireAdmin } from "@/lib/auth-guard";
import { db } from "@/prisma/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const isActive = searchParams.get("isActive");
  const where: any = {};
  if (isActive !== null) where.isActive = isActive !== "false";
  const data = await db.tenureType.findMany({ where, orderBy: { name: "asc" } });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const guard = requireAdmin(session);
  if (guard) return guard;

  try {
    const body = await req.json();
    if (!body.name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });
    if (!body.code?.trim()) return NextResponse.json({ error: "Code is required" }, { status: 400 });
    const item = await db.tenureType.create({
      data: {
        name: body.name.trim(),
        code: body.code.trim().toUpperCase(),
        description: body.description || null,
      },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (err: any) {
    if (err.code === "P2002") return NextResponse.json({ error: "Tenure type already exists" }, { status: 409 });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}