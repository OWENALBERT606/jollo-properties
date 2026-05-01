import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import { requireOfficer } from "@/lib/auth-guard";
import { db } from "@/prisma/db";

const statusFlow: Record<string, string[]> = {
  FILED: ["UNDER_INVESTIGATION", "DISMISSED"],
  UNDER_INVESTIGATION: ["HEARING", "DISMISSED"],
  HEARING: ["RESOLVED", "DISMISSED"],
  RESOLVED: [],
  DISMISSED: [],
};

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const item = await db.dispute.findUnique({
    where: { id: (await params).id },
    include: {
      property: { select: { id: true, plotNumber: true, title: true, district: true, address: true } },
      complainant: { select: { id: true, name: true, email: true, phone: true } },
      notes: { orderBy: { createdAt: "asc" }, include: { addedBy: { select: { name: true } } } },
    },
  });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const guard = requireOfficer(session);
  if (guard) return guard;

  try {
    const body = await req.json();
    const current = await db.dispute.findUnique({ where: { id: (await params).id } });
    if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const updateData: any = {};

    if (body.status) {
      const allowed = statusFlow[current.status] || [];
      if (!allowed.includes(body.status)) {
        return NextResponse.json({ error: `Cannot transition from ${current.status} to ${body.status}` }, { status: 400 });
      }
      updateData.status = body.status;
      if (body.status === "RESOLVED" || body.status === "DISMISSED") {
        updateData.resolvedAt = new Date();
      }
    }

    if (body.resolution !== undefined) updateData.resolution = body.resolution;

    const item = await db.dispute.update({ where: { id: (await params).id }, data: updateData });
    return NextResponse.json(item);
  } catch (err: any) {
    if (err.code === "P2025") return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const guard = requireOfficer(session);
  if (guard) return guard;

  try {
    // Soft delete - dismiss
    const item = await db.dispute.update({
      where: { id: (await params).id },
      data: { status: "DISMISSED", resolvedAt: new Date() },
    });
    return NextResponse.json(item);
  } catch (err: any) {
    if (err.code === "P2025") return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}