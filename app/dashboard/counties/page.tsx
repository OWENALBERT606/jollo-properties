import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import { redirect } from "next/navigation";
import { db } from "@/prisma/db";
import CountiesClient from "./CountiesClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CountiesPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") redirect("/dashboard");

  const [data, districts] = await Promise.all([
    db.county.findMany({ orderBy: { name: "asc" } }),
    db.district.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }).then((r) => r.map((x) => x.name)),
  ]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-brand-blue">Counties</h1>
        <p className="text-sm text-gray-500 mt-0.5">{data.length} counties registered</p>
      </div>
      <CountiesClient data={data} districts={districts} />
    </div>
  );
}
