import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import { redirect } from "next/navigation";
import { db } from "@/prisma/db";
import MapClient from "./MapClient";

export default async function MapPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "LAND_OFFICER" && session.user.role !== "ADMIN")) redirect("/dashboard");

  let properties: any[] = [];
  try {
    properties = await db.property.findMany({
      select: {
        id: true, title: true, plotNumber: true, district: true,
        status: true, latitude: true, longitude: true, tenure: true, type: true,
      },
      where: { latitude: { not: null }, longitude: { not: null } },
    });
  } catch {}

  return (
    <div className="space-y-3">
      <div>
        <h1 className="text-xl font-bold text-brand-blue">GIS Property Map</h1>
        <p className="text-sm text-gray-500 mt-0.5">{properties.length} properties with location data</p>
      </div>
      <div className="h-[calc(100vh-180px)] rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
        <MapClient properties={properties} />
      </div>
    </div>
  );
}
