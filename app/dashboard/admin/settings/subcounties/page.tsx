import { db } from "@/prisma/db";
import SubcountiesClient from "./SubcountiesClient";

export default async function SubcountiesPage() {
  const subcounties = await db.subcounty.findMany({ orderBy: { name: "asc" } });
  return <SubcountiesClient data={subcounties} />;
}