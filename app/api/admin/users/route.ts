import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import { requireAdmin } from "@/lib/auth-guard";
import { db } from "@/prisma/db";
import bcrypt from "bcryptjs";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const guard = requireAdmin(session);
  if (guard) return guard;

  const { searchParams } = new URL(req.url);
  const role = searchParams.get("role");
  const where: any = {};
  if (role) where.role = role;
  const data = await db.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: { id: true, email: true, name: true, phone: true, nin: true, ninVerified: true, role: true, image: true, createdAt: true },
  });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const guard = requireAdmin(session);
  if (guard) return guard;

  try {
    const body = await req.json();
    if (!body.email?.trim()) return NextResponse.json({ error: "Email is required" }, { status: 400 });
    if (!body.name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });
    if (!body.password) return NextResponse.json({ error: "Password is required" }, { status: 400 });

    const existing = await db.user.findUnique({ where: { email: body.email } });
    if (existing) return NextResponse.json({ error: "Email already exists" }, { status: 409 });

    const passwordHash = await bcrypt.hash(body.password, 12);
    const item = await db.user.create({
      data: {
        email: body.email.trim().toLowerCase(),
        name: body.name.trim(),
        phone: body.phone?.trim() || null,
        nin: body.nin?.trim() || null,
        role: body.role || "PUBLIC_USER",
        passwordHash,
      },
    });
    return NextResponse.json({ id: item.id, email: item.email, name: item.name, role: item.role }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}