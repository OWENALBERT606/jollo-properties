import { db } from "@/prisma/db";
import CountiesClient from "./CountiesClient";

export default async function CountiesPage() {
  const counties = await db.county.findMany({ orderBy: { name: "asc" } });
  return <CountiesClient data={counties} />;
}