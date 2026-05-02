import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import { redirect } from "next/navigation";
import { db } from "@/prisma/db";
import StatsCard from "@/components/dashboard/StatsCard";
import { CheckCircle, Building2, Users, AlertTriangle } from "lucide-react";
import { formatDistanceToNow, subMonths, startOfMonth, endOfMonth, format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import AdminApprovalsWidget from "@/components/dashboard/AdminApprovalsWidget";
import SalesCharts from "@/components/dashboard/SalesCharts";

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") redirect("/dashboard");

  let stats = { properties: 0, owners: 0, pending: 0, disputes: 0 };
  let salesStats = { completed: 0, active: 0, partial: 0, totalValue: 0 };
  let recentLogs: any[] = [];
  let pendingProperties: any[] = [];
  let monthlySales: { month: string; count: number }[] = [];

  try {
    const now = new Date();
    // Build 6-month range
    const monthRanges = Array.from({ length: 6 }, (_, i) => {
      const d = subMonths(now, 5 - i);
      return { label: format(d, "MMM yy"), start: startOfMonth(d), end: endOfMonth(d) };
    });

    const [properties, owners, pending, disputes, logs, pendingProps, completedSales, activeSales, partialSales, totalSalesAgg, ...monthlyResults] = await Promise.all([
      db.property.count(),
      db.user.count({ where: { role: "PUBLIC_USER" } }),
      db.property.count({ where: { status: "PENDING_APPROVAL" } }),
      db.dispute.count({ where: { status: { in: ["FILED", "UNDER_INVESTIGATION", "HEARING"] } } }),
      db.auditLog.findMany({ take: 10, orderBy: { createdAt: "desc" }, include: { actor: true } }),
      db.property.findMany({ where: { status: "PENDING_APPROVAL" }, take: 5, orderBy: { createdAt: "desc" } }),
      db.transaction.count({ where: { type: "SALE", status: "COMPLETED" } }),
      db.transaction.count({ where: { type: "SALE", status: { in: ["INITIATED", "APPROVED"] } } }),
      db.transaction.count({ where: { type: "SALE", status: "UNDER_REVIEW" } }),
      db.transaction.aggregate({ where: { type: "SALE", status: "COMPLETED" }, _sum: { amount: true } }),
      // Monthly completed sales queries
      ...monthRanges.map((r) =>
        db.transaction.count({
          where: { type: "SALE", status: "COMPLETED", completedDate: { gte: r.start, lte: r.end } },
        })
      ),
    ]);

    stats = { properties, owners, pending, disputes };
    salesStats = {
      completed: completedSales,
      active: activeSales,
      partial: partialSales,
      totalValue: totalSalesAgg._sum.amount ? Number(totalSalesAgg._sum.amount) : 0,
    };
    recentLogs = logs;
    pendingProperties = pendingProps;
    monthlySales = monthRanges.map((r, i) => ({ month: r.label, count: monthlyResults[i] as number }));
  } catch {}

  const actionBadge: Record<string, string> = {
    CREATE: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    UPDATE: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    DELETE: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
    APPROVE: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
    REJECT: "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  };

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label="Total Properties" value={stats.properties} iconName="Building2" color="bg-brand-blue-pale text-brand-blue" />
        <StatsCard label="Registered Owners" value={stats.owners} iconName="Users" color="bg-green-50 text-green-600" />
        <StatsCard label="Pending Approvals" value={stats.pending} iconName="Clock" color="bg-amber-50 text-amber-600" />
        <StatsCard label="Active Disputes" value={stats.disputes} iconName="AlertTriangle" color="bg-red-50 text-brand-red" />
      </div>

      {/* Sales Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label="Completed Sales" value={salesStats.completed} iconName="CheckCircle" color="bg-teal-50 text-teal-600" />
        <StatsCard label="Active Sales" value={salesStats.active} iconName="CreditCard" color="bg-blue-50 text-blue-600" />
        <StatsCard label="Partial Payments" value={salesStats.partial} iconName="Clock" color="bg-amber-50 text-amber-600" />
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 flex flex-col gap-1">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Total Sales Value</p>
          <p className="text-lg font-bold text-teal-600 leading-tight">
            UGX {salesStats.totalValue.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Sales Charts */}
      <SalesCharts
        monthlySales={monthlySales}
        activeSales={salesStats.active}
        partialSales={salesStats.partial}
        completedSales={salesStats.completed}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
          <h2 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Recent Activity</h2>
          {recentLogs.length === 0 ? (
            <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">No activity yet</p>
          ) : (
            <div className="space-y-3">
              {recentLogs.map((log) => (
                <div key={log.id} className="flex items-start justify-between gap-3 py-2 border-b border-gray-50 dark:border-gray-700 last:border-0">
                  <div className="flex items-start gap-2">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${actionBadge[log.action] || "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"}`}>
                      {log.action}
                    </span>
                    <div>
                      <div className="text-sm text-gray-700 dark:text-gray-300">{log.entityType}</div>
                      <div className="text-xs text-gray-400 dark:text-gray-500">{log.actor?.name ?? "System"}</div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                    {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Approvals */}
        <AdminApprovalsWidget properties={pendingProperties} />
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { href: "/dashboard/register", label: "Register Property", color: "bg-brand-blue text-white", Icon: Building2 },
          { href: "/dashboard/users", label: "Add User", color: "bg-green-600 text-white", Icon: Users },
          { href: "/dashboard/reports", label: "View Reports", color: "bg-purple-600 text-white", Icon: CheckCircle },
          { href: "/dashboard/disputes", label: "Disputes", color: "bg-brand-red text-white", Icon: AlertTriangle },
        ].map(({ href, label, color, Icon }) => (
          <a key={href} href={href} className={`${color} rounded-xl p-4 flex items-center gap-3 hover:opacity-90 transition-opacity`}>
            <Icon className="h-5 w-5" />
            <span className="text-sm font-medium">{label}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
