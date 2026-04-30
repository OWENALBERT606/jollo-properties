import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import { requireAdmin } from "@/lib/auth-guard";
import { db } from "@/prisma/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const district = searchParams.get("district");
  const isActive = searchParams.get("isActive");
  const where: any = {};
  if (district) where.district = district;
  if (isActive !== null) where.isActive = isActive !== "false";
  const data = await db.county.findMany({ where, orderBy: { name: "asc" } });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const guard = requireAdmin(session);
  if (guard) return guard;

  try {
    const body = await req.json();
    if (!body.name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });
    if (!body.district?.trim()) return NextResponse.json({ error: "District is required" }, { status: 400 });
    const item = await db.county.create({
      data: {
        name: body.name.trim(),
        district: body.district,
        region: body.region || null,
      },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (err: any) {
    if (err.code === "P2002") return NextResponse.json({ error: "County name already exists in this district" }, { status: 409 });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}