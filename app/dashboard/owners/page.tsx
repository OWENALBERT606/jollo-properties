import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import { redirect } from "next/navigation";
import { db } from "@/prisma/db";
import OwnersTable from "@/components/dashboard/OwnersTable";

export default async function OwnersPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "LAND_OFFICER" && session.user.role !== "ADMIN")) redirect("/dashboard");

  let owners: any[] = [];
  try {
    owners = await db.user.findMany({
      where: { role: "PUBLIC_USER" },
      include: { _count: { select: { ownerships: { where: { isActive: true } } } } },
      orderBy: { createdAt: "desc" },
    });
  } catch {}

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-brand-blue">Owner Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">{owners.length} registered owners</p>
        </div>
      </div>
      <OwnersTable initialOwners={owners} />
    </div>
  );
}
