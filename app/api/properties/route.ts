import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import { db } from "@/prisma/db";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "LAND_OFFICER" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { owners, documents, officerId, ...propertyData } = body;

    const property = await db.property.create({
      data: {
        ...propertyData,
        status: "PENDING_APPROVAL",
        size: Number(propertyData.size),
        price: propertyData.price ? Number(propertyData.price) : null,
      },
    });

    // Create ownership records
    if (owners?.length > 0) {
      await db.propertyOwner.createMany({
        data: owners.map((o: any, i: number) => ({
          propertyId: property.id,
          userId: o.userId,
          sharePercentage: o.share,
          isPrimary: i === 0,
          isActive: true,
        })),
      });
    }

    // Create document records
    if (documents?.length > 0) {
      await db.document.createMany({
        data: documents.map((d: any) => ({
          propertyId: property.id,
          uploadedById: session.user.id,
          name: d.name,
          type: d.type,
          r2Key: d.r2Key,
          r2Url: d.r2Url,
          mimeType: d.mimeType,
          sizeBytes: d.sizeBytes,
        })),
      });
    }

    // Create workflow step
    await db.workflowStep.create({
      data: {
        propertyId: property.id,
        stepName: "Initial Review",
        assigneeId: session.user.id,
        status: "PENDING",
      },
    });

    // Audit log
    await db.auditLog.create({
      data: {
        actorId: session.user.id,
        action: "CREATE",
        entityType: "Property",
        entityId: property.id,
        propertyId: property.id,
        newValue: { plotNumber: property.plotNumber, status: "PENDING_APPROVAL" },
      },
    });

    return NextResponse.json(property, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const { searchParams } = new URL(req.url);
  const cursor = searchParams.get("cursor");
  const take = Number(searchParams.get("take") || 9);
  const district = searchParams.get("district");
  const type = searchParams.get("type");
  const tenure = searchParams.get("tenure");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const sort = searchParams.get("sort");

  const where: any = { isPublicListing: true };
  if (district) where.district = district;
  if (type) where.type = type;
  if (tenure) where.tenure = tenure;
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price.gte = Number(minPrice);
    if (maxPrice) where.price.lte = Number(maxPrice);
  }

  const orderBy: any =
    sort === "price_asc" ? { price: "asc" } :
    sort === "price_desc" ? { price: "desc" } :
    { createdAt: "desc" };

  const query: any = {
    where,
    orderBy,
    take: take + 1,
    select: {
      id: true,
      plotNumber: true,
      title: true,
      district: true,
      county: true,
      subcounty: true,
      village: true,
      address: true,
      size: true,
      sizeUnit: true,
      tenure: true,
      type: true,
      status: true,
      price: true,
      latitude: true,
      longitude: true,
    },
    include: {
      documents: {
        where: { type: "PHOTO" },
        select: { id: true, r2Url: true, name: true },
        take: 3,
      },
    },
  };
  if (cursor) {
    query.cursor = { id: cursor };
    query.skip = 1;
  }

  const results = await db.property.findMany(query);
  const hasMore = results.length > take;
  if (hasMore) results.pop();

  const properties = results.map((p: any) => ({
    ...p,
    price: Number(p.price),
    size: Number(p.size),
  }));

  return NextResponse.json({
    properties,
    nextCursor: hasMore ? results[results.length - 1]?.id : null,
  });
}
