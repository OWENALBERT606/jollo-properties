import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import { requireAdmin, requireOfficer } from "@/lib/auth-guard";
import { db } from "@/prisma/db";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const item = await db.property.findUnique({
    where: { id: params.id },
    include: {
      owners: { include: { user: { select: { id: true, name: true, email: true, phone: true } } } },
      documents: { orderBy: { createdAt: "desc" } },
      valuations: { orderBy: { valuationDate: "desc" }, include: { officer: { select: { name: true } } } },
      transactions: { orderBy: { createdAt: "desc" } },
      _count: { select: { documents: true, transactions: true, disputes: true } },
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

    if (body.title) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.district) updateData.district = body.district;
    if (body.county !== undefined) updateData.county = body.county;
    if (body.subcounty !== undefined) updateData.subcounty = body.subcounty;
    if (body.village !== undefined) updateData.village = body.village;
    if (body.address !== undefined) updateData.address = body.address;
    if (body.size) updateData.size = body.size;
    if (body.sizeUnit) updateData.sizeUnit = body.sizeUnit;
    if (body.tenure) updateData.tenure = body.tenure;
    if (body.type) updateData.type = body.type;
    if (body.status) updateData.status = body.status;
    if (body.condition !== undefined) updateData.condition = body.condition;
    if (body.price !== undefined) updateData.price = body.price;
    if (body.latitude !== undefined) updateData.latitude = body.latitude;
    if (body.longitude !== undefined) updateData.longitude = body.longitude;
    if (body.isFeatured !== undefined) updateData.isFeatured = body.isFeatured;
    if (body.isPublicListing !== undefined) updateData.isPublicListing = body.isPublicListing;

    const item = await db.property.update({ where: { id: params.id }, data: updateData });
    return NextResponse.json(item);
  } catch (err: any) {
    if (err.code === "P2025") return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const guard = requireAdmin(session);
  if (guard) return guard;

  try {
    // Soft delete - archive the property
    const item = await db.property.update({ where: { id: params.id }, data: { status: "ARCHIVED" } });
    return NextResponse.json(item);
  } catch (err: any) {
    if (err.code === "P2025") return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}