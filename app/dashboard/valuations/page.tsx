import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import { redirect } from "next/navigation";
import { db } from "@/prisma/db";
import ValuationsTable from "@/components/dashboard/ValuationsTable";

export default async function ValuationsPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "LAND_OFFICER" && session.user.role !== "ADMIN")) redirect("/dashboard");

  let valuations: any[] = [];
  try {
    valuations = await db.valuation.findMany({
      include: {
        property: { select: { title: true, plotNumber: true, district: true } },
        officer: { select: { name: true } },
        payments: true,
      },
      orderBy: { createdAt: "desc" },
    });
  } catch {}

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-brand-blue">Valuations & Tax</h1>
        <p className="text-sm text-gray-500 mt-0.5">{valuations.length} valuations recorded</p>
      </div>
      <ValuationsTable initialValuations={valuations} officerId={session.user.id} />
    </div>
  );
}
