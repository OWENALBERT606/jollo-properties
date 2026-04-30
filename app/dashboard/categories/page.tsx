import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import { redirect } from "next/navigation";
import { db } from "@/prisma/db";
import CategoriesClient from "./CategoriesClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function CategoriesPage() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") redirect("/dashboard");

  const data = await db.propertyCategory.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-brand-blue">Property Categories</h1>
        <p className="text-sm text-gray-500 mt-0.5">{data.length} categories</p>
      </div>
      <CategoriesClient data={data} />
    </div>
  );
}
