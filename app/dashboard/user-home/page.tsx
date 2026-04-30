import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import { redirect } from "next/navigation";
import { db } from "@/prisma/db";
import StatsCard from "@/components/dashboard/StatsCard";
import { Building2, ArrowLeftRight, FolderOpen } from "lucide-react";
import Link from "next/link";

export default async function UserDashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  let stats = { properties: 0, transactions: 0, documents: 0 };
  try {
    const [properties, transactions, documents] = await Promise.all([
      db.propertyOwner.count({ where: { userId: session.user.id, isActive: true } }),
      db.transaction.count({ where: { OR: [{ buyerId: session.user.id }, { sellerId: session.user.id }] } }),
      db.document.count({ where: { uploadedById: session.user.id } }),
    ]);
    stats = { properties, transactions, documents };
  } catch {}

  return (
    <div className="space-y-6">
      <div className="bg-brand-blue-pale rounded-2xl p-5">
        <h2 className="text-lg font-bold text-brand-blue">Welcome back, {session.user.name?.split(" ")[0]}!</h2>
        <p className="text-sm text-gray-500 mt-1">Here&apos;s an overview of your properties and activity.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard label="My Properties" value={stats.properties} iconName="Building2" color="bg-brand-blue-pale text-brand-blue" />
        <StatsCard label="Transactions" value={stats.transactions} iconName="ArrowLeftRight" color="bg-green-50 text-green-600" />
        <StatsCard label="Documents" value={stats.documents} iconName="FolderOpen" color="bg-purple-50 text-purple-600" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { href: "/dashboard/my-properties", label: "My Properties", color: "bg-brand-blue text-white", Icon: Building2 },
          { href: "/dashboard/my-transactions", label: "Transactions", color: "bg-green-600 text-white", Icon: ArrowLeftRight },
          { href: "/dashboard/documents", label: "Documents", color: "bg-purple-600 text-white", Icon: FolderOpen },
        ].map(({ href, label, color, Icon }) => (
          <Link key={href} href={href} className={`${color} rounded-xl p-4 flex items-center gap-3 hover:opacity-90 transition-opacity`}>
            <Icon className="h-5 w-5" />
            <span className="text-sm font-medium">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
