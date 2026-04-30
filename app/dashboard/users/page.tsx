import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import { redirect } from "next/navigation";
import { db } from "@/prisma/db";
import AdminUsersTable from "@/components/dashboard/AdminUsersTable";

export default async function AdminUsersPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") redirect("/dashboard");

  let users: any[] = [];
  try {
    users = await db.user.findMany({
      include: { _count: { select: { ownerships: { where: { isActive: true } } } } },
      orderBy: { createdAt: "desc" },
    });
  } catch {}

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-brand-blue">User Management</h1>
        <p className="text-sm text-gray-500 mt-0.5">{users.length} users registered</p>
      </div>
      <AdminUsersTable initialUsers={users} />
    </div>
  );
}
