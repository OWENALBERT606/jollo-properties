import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const role = session.user.role;
  if (role === "ADMIN") redirect("/dashboard/admin-home");
  if (role === "LAND_OFFICER") redirect("/dashboard/officer-home");
  redirect("/dashboard/user-home");
}
