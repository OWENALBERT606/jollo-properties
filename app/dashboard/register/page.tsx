import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import { redirect } from "next/navigation";
import RegisterPageClient from "./RegisterPageClient";

export default async function RegisterPropertyPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user.role !== "LAND_OFFICER" && session.user.role !== "ADMIN")) redirect("/dashboard");
  return <RegisterPageClient officerId={session.user.id} />;
}
