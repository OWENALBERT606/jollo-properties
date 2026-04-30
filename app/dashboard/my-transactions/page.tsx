import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import { redirect } from "next/navigation";
import { db } from "@/prisma/db";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

const statusColors: Record<string, string> = {
  INITIATED: "bg-blue-100 text-blue-700",
  UNDER_REVIEW: "bg-amber-100 text-amber-700",
  APPROVED: "bg-green-100 text-green-700",
  COMPLETED: "bg-teal-100 text-teal-700",
  REJECTED: "bg-red-100 text-red-700",
  CANCELLED: "bg-gray-100 text-gray-600",
};

export default async function UserTransactionsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  let transactions: any[] = [];
  try {
    transactions = await db.transaction.findMany({
      where: { OR: [{ buyerId: session.user.id }, { sellerId: session.user.id }, { initiatedById: session.user.id }] },
      include: { property: { select: { title: true, plotNumber: true } } },
      orderBy: { createdAt: "desc" },
    });
  } catch {}

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-brand-blue">My Transactions</h1>
      {transactions.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <p className="text-gray-500">No transactions found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="divide-y divide-gray-50">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-4 hover:bg-gray-50">
                <div>
                  <div className="text-sm font-medium text-gray-800">{tx.property?.title}</div>
                  <div className="text-xs text-gray-400">{tx.type} · {tx.property?.plotNumber}</div>
                </div>
                <div className="flex items-center gap-3">
                  {tx.amount && <span className="text-sm font-medium text-brand-blue">UGX {Number(tx.amount).toLocaleString()}</span>}
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColors[tx.status] || "bg-gray-100"}`}>
                    {tx.status.replace("_", " ")}
                  </span>
                  <span className="text-xs text-gray-400">{formatDistanceToNow(new Date(tx.createdAt), { addSuffix: true })}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
