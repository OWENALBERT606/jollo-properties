import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import { redirect } from "next/navigation";
import { db } from "@/prisma/db";
import StatsCard from "@/components/dashboard/StatsCard";
import { Building2, ArrowLeftRight, AlertTriangle, Scale } from "lucide-react";
import Link from "next/link";

export default async function OfficerDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "LAND_OFFICER" && session.user.role !== "ADMIN")) redirect("/dashboard");

  let stats = { properties: 0, transactions: 0, disputes: 0, valuations: 0 };
  try {
    const [properties, transactions, disputes, valuations] = await Promise.all([
      db.property.count({ where: { status: "PENDING_APPROVAL" } }),
      db.transaction.count({ where: { status: { in: ["INITIATED", "UNDER_REVIEW"] } } }),
      db.dispute.count({ where: { status: { in: ["FILED", "UNDER_INVESTIGATION"] } } }),
      db.valuation.count(),
    ]);
    stats = { properties, transactions, disputes, valuations };
  } catch {}

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label="Pending Properties" value={stats.properties} iconName="Building2" color="bg-amber-50 text-amber-600" />
        <StatsCard label="Active Transactions" value={stats.transactions} iconName="ArrowLeftRight" color="bg-brand-blue-pale text-brand-blue" />
        <StatsCard label="Open Disputes" value={stats.disputes} iconName="AlertTriangle" color="bg-red-50 text-brand-red" />
        <StatsCard label="Valuations Done" value={stats.valuations} iconName="Scale" color="bg-green-50 text-green-600" />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h2 className="font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { href: "/dashboard/register", label: "Register Property", color: "bg-brand-blue text-white", Icon: Building2 },
            { href: "/dashboard/transactions", label: "Transactions", color: "bg-green-600 text-white", Icon: ArrowLeftRight },
            { href: "/dashboard/disputes", label: "Disputes", color: "bg-brand-red text-white", Icon: AlertTriangle },
            { href: "/dashboard/valuations", label: "Valuations", color: "bg-purple-600 text-white", Icon: Scale },
          ].map(({ href, label, color, Icon }) => (
            <Link key={href} href={href} className={`${color} rounded-xl p-4 flex items-center gap-3 hover:opacity-90 transition-opacity`}>
              <Icon className="h-5 w-5" />
              <span className="text-sm font-medium">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
