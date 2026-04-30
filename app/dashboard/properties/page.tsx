import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import { redirect } from "next/navigation";
import { db } from "@/prisma/db";
import AdminPropertiesTable from "@/components/dashboard/AdminPropertiesTable";

function serializeProperty(prop: any) {
  return {
    ...prop,
    size: Number(prop.size) || 0,
    price: prop.price ? Number(prop.price) : null,
    latitude: prop.latitude ? Number(prop.latitude) : null,
    longitude: prop.longitude ? Number(prop.longitude) : null,
  };
}

export default async function AdminPropertiesPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "LAND_OFFICER")) redirect("/dashboard");

  let properties: any[] = [];
  try {
    const raw = await db.property.findMany({
      include: {
        owners: { where: { isActive: true }, include: { user: { select: { name: true } } } },
        _count: { select: { documents: true, transactions: true, disputes: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    properties = raw.map(serializeProperty);
  } catch {}

  return (
    <AdminPropertiesTable
      initialProperties={properties}
      officerId={session.user.id}
    />
  );
}
