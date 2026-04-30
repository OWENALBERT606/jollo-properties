import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import { redirect } from "next/navigation";
import ReportsClient from "@/components/dashboard/ReportsClient";

export default async function AdminReportsPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") redirect("/dashboard");
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-brand-blue">Reports & Export</h1>
        <p className="text-sm text-gray-500 mt-0.5">Generate and export reports</p>
      </div>
      <ReportsClient />
    </div>
  );
}
