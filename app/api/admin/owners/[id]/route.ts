import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import { requireOfficer } from "@/lib/auth-guard";
import { db } from "@/prisma/db";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const item = await db.propertyOwner.findUnique({
    where: { id: params.id },
    include: {
      property: { select: { id: true, plotNumber: true, title: true } },
      user: { select: { id: true, name: true, email: true, phone: true } },
    },
  });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const guard = requireOfficer(session);
  if (guard) return guard;

  try {
    const body = await req.json();
    const updateData: any = {};

    // Handle primary switch
    if (body.isPrimary === true) {
      const current = await db.propertyOwner.findUnique({ where: { id: params.id } });
      if (current) {
        await db.propertyOwner.updateMany({
          where: { propertyId: current.propertyId, isActive: true },
          data: { isPrimary: false },
        });
      }
    }

    if (body.sharePercentage) updateData.sharePercentage = body.sharePercentage;
    if (body.isPrimary !== undefined) updateData.isPrimary = body.isPrimary;
    if (body.endDate) updateData.endDate = body.endDate;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.isActive !== undefined) {
      updateData.isActive = body.isActive;
      if (!body.isActive) updateData.endDate = new Date();
    }

    const item = await db.propertyOwner.update({ where: { id: params.id }, data: updateData });
    return NextResponse.json(item);
  } catch (err: any) {
    if (err.code === "P2025") return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const guard = requireOfficer(session);
  if (guard) return guard;

  try {
    // Soft delete
    const item = await db.propertyOwner.update({
      where: { id: params.id },
      data: { isActive: false, endDate: new Date() },
    });
    return NextResponse.json(item);
  } catch (err: any) {
    if (err.code === "P2025") return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}