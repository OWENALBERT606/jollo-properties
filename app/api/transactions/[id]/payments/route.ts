import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import { db } from "@/prisma/db";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const installments = await db.paymentInstallment.findMany({
    where: { transactionId: id },
    orderBy: { paidAt: "asc" },
  });
  return NextResponse.json(installments);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  try {
    const body = await req.json();
    if (!body.amount || body.amount <= 0) return NextResponse.json({ error: "Amount required" }, { status: 400 });

    const tx = await db.transaction.findUnique({
      where: { id },
      include: { installments: true },
    });
    if (!tx) return NextResponse.json({ error: "Transaction not found" }, { status: 404 });

    const installment = await db.paymentInstallment.create({
      data: {
        transactionId: id,
        amount: body.amount,
        method: body.method || "CASH",
        notes: body.notes || null,
        paidAt: body.paidAt ? new Date(body.paidAt) : new Date(),
      },
    });

    // Always hide from public listing once any payment is made
    await db.property.update({
      where: { id: tx.propertyId },
      data: { isPublicListing: false },
    });

    // Recalculate total paid
    const allInstallments = [...tx.installments, installment];
    const totalPaid = allInstallments.reduce((sum, i) => sum + Number(i.amount), 0);
    const agreedAmount = Number(tx.amount) || 0;
    const isFullyPaid = agreedAmount > 0 && totalPaid >= agreedAmount;

    if (isFullyPaid && tx.status !== "COMPLETED") {
      await db.transaction.update({ where: { id }, data: { status: "COMPLETED", completedDate: new Date() } });
      await db.property.update({
        where: { id: tx.propertyId },
        data: { status: "TRANSFERRED", isPublicListing: false },
      });
      // Register buyer as owner if set
      if (tx.buyerId) {
        const existing = await db.propertyOwner.findFirst({
          where: { propertyId: tx.propertyId, userId: tx.buyerId, isActive: true },
        });
        if (!existing) {
          // Deactivate previous owners
          await db.propertyOwner.updateMany({
            where: { propertyId: tx.propertyId, isActive: true },
            data: { isActive: false, endDate: new Date() },
          });
          await db.propertyOwner.create({
            data: {
              propertyId: tx.propertyId,
              userId: tx.buyerId,
              sharePercentage: 100,
              isPrimary: true,
              isActive: true,
            },
          });
        }
      }
    } else if (!isFullyPaid && tx.status === "INITIATED") {
      // Mark as under review once first payment comes in
      await db.transaction.update({ where: { id }, data: { status: "UNDER_REVIEW" } });
    }

    return NextResponse.json({
      installment: { ...installment, amount: Number(installment.amount) },
      totalPaid,
      isFullyPaid,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
