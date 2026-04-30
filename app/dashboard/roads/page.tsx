import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import { redirect } from "next/navigation";
import { db } from "@/prisma/db";
import RoadsClient from "./RoadsClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function RoadsPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") redirect("/dashboard");

  const [data, districts] = await Promise.all([
    db.mainRoad.findMany({ orderBy: { name: "asc" } }),
    db.district.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }).then((r) => r.map((x) => x.name)),
  ]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-brand-blue">Main Roads</h1>
        <p className="text-sm text-gray-500 mt-0.5">{data.length} main roads registered</p>
      </div>
      <RoadsClient data={data} districts={districts} />
    </div>
  );
}
