import { db } from "@/prisma/db";
import StreetsClient from "./StreetsClient";

export default async function StreetsPage() {
  const streets = await db.street.findMany({ orderBy: { name: "asc" } });
  return <StreetsClient data={streets} />;
}