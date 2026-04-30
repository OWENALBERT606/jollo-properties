import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import { redirect } from "next/navigation";
import { db } from "@/prisma/db";
import DisputesTable from "@/components/dashboard/DisputesTable";

export default async function DisputesPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "LAND_OFFICER" && session.user.role !== "ADMIN")) redirect("/dashboard");

  let disputes: any[] = [];
  try {
    disputes = await db.dispute.findMany({
      include: {
        property: { select: { title: true, plotNumber: true } },
        complainant: { select: { name: true, email: true } },
        notes: { include: { addedBy: { select: { name: true } } }, orderBy: { createdAt: "asc" } },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch {}

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-brand-blue">Disputes</h1>
        <p className="text-sm text-gray-500 mt-0.5">{disputes.length} disputes on record</p>
      </div>
      <DisputesTable initialDisputes={disputes} officerId={session.user.id} />
    </div>
  );
}
