import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import { db } from "@/prisma/db";
import { hash } from "bcryptjs";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "LAND_OFFICER" && session.user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { buyer, documents, agreedPrice, discountLabel, discountAmount, ...data } = body;

  // Upsert buyer user from captured details
  let buyerId: string | null = null;
  if (buyer?.name && buyer?.nin) {
    const existing = await db.user.findFirst({
      where: { OR: [{ nin: buyer.nin }, ...(buyer.email ? [{ email: buyer.email }] : [])] },
    });
    if (existing) {
      // Update any missing fields on the existing user
      await db.user.update({
        where: { id: existing.id },
        data: {
          phone: existing.phone || buyer.phone || null,
          nin: existing.nin || buyer.nin || null,
        },
      });
      buyerId = existing.id;
    } else {
      const tempPassword = await hash(randomUUID(), 10);
      const email = buyer.email?.trim() || `${buyer.nin.toLowerCase().replace(/\s+/g, "")}@jollo.internal`;
      const created = await db.user.create({
        data: {
          name: buyer.name.trim(),
          nin: buyer.nin.trim(),
          phone: buyer.phone?.trim() || null,
          email,
          passwordHash: tempPassword,
          role: "PUBLIC_USER",
        },
      });
      buyerId = created.id;
    }
  }

  const netAmount = agreedPrice
    ? Number(agreedPrice) - (discountAmount ? Number(discountAmount) : 0)
    : data.amount
    ? Number(data.amount)
    : null;

  const tx = await db.transaction.create({
    data: {
      type: data.type,
      propertyId: data.propertyId,
      currency: data.currency || "UGX",
      agreementDate: data.agreementDate ? new Date(data.agreementDate) : null,
      notes: data.notes || null,
      initiatedById: session.user.id,
      buyerId,
      amount: netAmount,
      agreedPrice: agreedPrice ? Number(agreedPrice) : null,
      discountLabel: discountLabel || null,
      discountAmount: discountAmount ? Number(discountAmount) : null,
    },
    include: {
      property: { select: { title: true, plotNumber: true } },
      buyer: { select: { name: true, nin: true, phone: true } },
      initiatedBy: { select: { name: true } },
    },
  });

  // Create document records for uploaded attachments
  if (Array.isArray(documents) && documents.length > 0) {
    await db.document.createMany({
      data: documents.map((d: any) => ({
        propertyId: data.propertyId,
        uploadedById: session.user.id,
        name: d.name,
        type: d.docType || "AGREEMENT",
        r2Key: d.r2Key,
        r2Url: d.r2Url,
        mimeType: d.mimeType || null,
        sizeBytes: d.sizeBytes || null,
      })),
    });
  }

  await db.workflowStep.create({
    data: { transactionId: tx.id, stepName: "Initial Review", assigneeId: session.user.id, status: "PENDING" },
  });

  await db.auditLog.create({
    data: {
      actorId: session.user.id,
      action: "CREATE",
      entityType: "Transaction",
      entityId: tx.id,
      transactionId: tx.id,
      propertyId: data.propertyId,
      newValue: { type: tx.type, amount: netAmount, buyer: buyer?.name },
    },
  });

  return NextResponse.json({
    ...tx,
    amount: tx.amount ? Number(tx.amount) : null,
    agreedPrice: (tx as any).agreedPrice ? Number((tx as any).agreedPrice) : null,
    discountAmount: (tx as any).discountAmount ? Number((tx as any).discountAmount) : null,
    installments: [],
  }, { status: 201 });
}
