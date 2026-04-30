import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import { db } from "@/prisma/db";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "LAND_OFFICER")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "ownership";
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const dateFilter = from || to ? {
    createdAt: {
      ...(from ? { gte: new Date(from) } : {}),
      ...(to ? { lte: new Date(to) } : {}),
    },
  } : {};

  let data: any[] = [];

  if (type === "ownership") {
    const owners = await db.propertyOwner.findMany({
      where: { isActive: true, ...dateFilter },
      include: { user: { select: { name: true, email: true, nin: true } }, property: { select: { title: true, plotNumber: true, district: true, tenure: true } } },
    });
    data = owners.map((o) => ({
      "Owner Name": o.user.name, "Email": o.user.email, "NIN": o.user.nin || "—",
      "Property": o.property.title, "Plot No": o.property.plotNumber,
      "District": o.property.district, "Tenure": o.property.tenure,
      "Share %": Number(o.sharePercentage), "Primary": o.isPrimary ? "Yes" : "No",
    }));
  } else if (type === "transactions") {
    const txs = await db.transaction.findMany({
      where: dateFilter,
      include: { property: { select: { title: true, plotNumber: true } }, buyer: { select: { name: true } }, seller: { select: { name: true } } },
    });
    data = txs.map((t) => ({
      "Property": t.property.title, "Plot No": t.property.plotNumber,
      "Type": t.type, "Status": t.status,
      "Amount (UGX)": t.amount ? Number(t.amount) : "—",
      "Buyer": t.buyer?.name || "—", "Seller": t.seller?.name || "—",
      "Date": new Date(t.createdAt).toLocaleDateString(),
    }));
  } else if (type === "tax") {
    const valuations = await db.valuation.findMany({
      where: dateFilter,
      include: { property: { select: { title: true, plotNumber: true, district: true } }, payments: true },
    });
    data = valuations.map((v) => ({
      "Property": v.property.title, "Plot No": v.property.plotNumber,
      "District": v.property.district,
      "Valued Amount": Number(v.valuedAmount), "Tax Amount": Number(v.taxAmount),
      "Tax Rate": `${(Number(v.taxRate) * 100).toFixed(1)}%`,
      "Payment Status": v.payments.length > 0 ? "Paid" : "Pending",
      "Receipt No": v.payments[0]?.receiptNumber || "—",
      "Date": new Date(v.valuationDate).toLocaleDateString(),
    }));
  } else if (type === "disputes") {
    const disputes = await db.dispute.findMany({
      where: dateFilter,
      include: { property: { select: { title: true, plotNumber: true } }, complainant: { select: { name: true } } },
    });
    data = disputes.map((d) => ({
      "Title": d.title, "Property": d.property.title, "Plot No": d.property.plotNumber,
      "Complainant": d.complainant.name, "Status": d.status,
      "Resolution": d.resolution || "—",
      "Filed": new Date(d.createdAt).toLocaleDateString(),
      "Resolved": d.resolvedAt ? new Date(d.resolvedAt).toLocaleDateString() : "—",
    }));
  }

  return NextResponse.json({ data });
}
