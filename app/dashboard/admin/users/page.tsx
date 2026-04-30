import { db } from "@/prisma/db";
import UsersClient from "./UsersClient";

export default async function UsersPage() {
  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, email: true, name: true, phone: true, nin: true, ninVerified: true, role: true, image: true, createdAt: true },
  });
  return <UsersClient data={users} />;
}