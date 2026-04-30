import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import { redirect } from "next/navigation";
import { db } from "@/prisma/db";
import SubcountiesClient from "./SubcountiesClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SubcountiesPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") redirect("/dashboard");

  const [data, counties, districts] = await Promise.all([
    db.subcounty.findMany({ orderBy: { name: "asc" } }),
    db.county.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }).then((r) => r.map((x) => x.name)),
    db.district.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }).then((r) => r.map((x) => x.name)),
  ]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-brand-blue">Sub-counties</h1>
        <p className="text-sm text-gray-500 mt-0.5">{data.length} sub-counties registered</p>
      </div>
      <SubcountiesClient data={data} counties={counties} districts={districts} />
    </div>
  );
}
