import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import { redirect } from "next/navigation";
import { db } from "@/prisma/db";
import PropertyCard from "@/components/public/PropertyCard";

export default async function UserPropertiesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  let ownerships: any[] = [];
  try {
    ownerships = await db.propertyOwner.findMany({
      where: { userId: session.user.id, isActive: true },
      include: { property: true },
    });
  } catch {}

  const properties = ownerships.map((o) => o.property);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-brand-blue">My Properties</h1>
      {properties.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <div className="text-5xl mb-3">🏡</div>
          <p className="text-gray-500">You don&apos;t own any registered properties yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {properties.map((p, i) => <PropertyCard key={p.id} property={p} index={i} />)}
        </div>
      )}
    </div>
  );
}
