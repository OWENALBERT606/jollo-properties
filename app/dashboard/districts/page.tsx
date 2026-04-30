import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import { redirect } from "next/navigation";
import { db } from "@/prisma/db";
import DistrictsClient from "./DistrictsClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DistrictsPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") redirect("/dashboard");

  const [data, regionRecords] = await Promise.all([
    db.district.findMany({ orderBy: { name: "asc" } }),
    db.region.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
  ]);

  const regions = regionRecords.map((r) => r.name);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-brand-blue">Districts</h1>
        <p className="text-sm text-gray-500 mt-0.5">{data.length} districts registered</p>
      </div>
      <DistrictsClient data={data} regions={regions} />
    </div>
  );
}
