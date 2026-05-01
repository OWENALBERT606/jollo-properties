import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import { redirect } from "next/navigation";
import { db } from "@/prisma/db";
import StatsCard from "@/components/dashboard/StatsCard";
import { CheckCircle, XCircle, Building2, Users, AlertTriangle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import AdminApprovalsWidget from "@/components/dashboard/AdminApprovalsWidget";

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") redirect("/dashboard");

  let stats = { properties: 0, owners: 0, pending: 0, disputes: 0 };
  let recentLogs: any[] = [];
  let pendingProperties: any[] = [];

  try {
    const [properties, owners, pending, disputes, logs, pendingProps] = await Promise.all([
      db.property.count(),
      db.user.count({ where: { role: "PUBLIC_USER" } }),
      db.property.count({ where: { status: "PENDING_APPROVAL" } }),
      db.dispute.count({ where: { status: { in: ["FILED", "UNDER_INVESTIGATION", "HEARING"] } } }),
      db.auditLog.findMany({ take: 10, orderBy: { createdAt: "desc" }, include: { actor: true } }),
      db.property.findMany({ where: { status: "PENDING_APPROVAL" }, take: 5, orderBy: { createdAt: "desc" } }),
    ]);
    stats = { properties, owners, pending, disputes };
    recentLogs = logs;
    pendingProperties = pendingProps;
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
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label="Total Properties" value={stats.properties} iconName="Building2" color="bg-brand-blue-pale text-brand-blue" />
        <StatsCard label="Registered Owners" value={stats.owners} iconName="Users" color="bg-green-50 text-green-600" />
        <StatsCard label="Pending Approvals" value={stats.pending} iconName="Clock" color="bg-amber-50 text-amber-600" />
        <StatsCard label="Active Disputes" value={stats.disputes} iconName="AlertTriangle" color="bg-red-50 text-brand-red" />
      </div>

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
