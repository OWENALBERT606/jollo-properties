import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import { redirect } from "next/navigation";
import { db } from "@/prisma/db";
import TransactionsTable from "@/components/dashboard/TransactionsTable";

export default async function TransactionsPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "LAND_OFFICER" && session.user.role !== "ADMIN")) redirect("/dashboard");

  let transactions: any[] = [];
  try {
    const raw = await db.transaction.findMany({
      include: {
        property: { select: { title: true, plotNumber: true } },
        buyer: { select: { name: true } },
        seller: { select: { name: true } },
        initiatedBy: { select: { name: true } },
        installments: { orderBy: { paidAt: "asc" } },
      },
      orderBy: { createdAt: "desc" },
    });
    transactions = raw.map((t: any) => ({
      ...t,
      amount: t.amount ? Number(t.amount) : null,
      agreedPrice: t.agreedPrice ? Number(t.agreedPrice) : null,
      discountAmount: t.discountAmount ? Number(t.discountAmount) : null,
      installments: (t.installments || []).map((i: any) => ({ ...i, amount: Number(i.amount) })),
    }));
  } catch {}

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-brand-blue">Transactions</h1>
        <p className="text-sm text-gray-500 mt-0.5">{transactions.length} total transactions</p>
      </div>
      <TransactionsTable initialTransactions={transactions} officerId={session.user.id} />
    </div>
  );
}
