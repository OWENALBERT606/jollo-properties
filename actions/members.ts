"use server";

import { db } from "@/prisma/db";
import { revalidatePath } from "next/cache";

// Define Member props
export type MemberProps = {
  name: string;
  phone: string;
  email: string;
  parishId: string;
  villageId: string;
  motivation?: string;
};

// ✅ Create new member
export async function createMember(data: any) {
  try {
    const existingMember = await db.member.findFirst({
      where: {
        OR: [
          { phone: data.phone },
          { email: data.email },
        ],
      },
    });

    if (existingMember) {
      // You might want to handle this case differently, e.g., return a specific error
      return existingMember;
    }

    const newMember = await db.member.create({
      data,
    });

    revalidatePath("/hoimacitywest");
    return newMember;
  } catch (error) {
    console.error("Error creating member:", error);
    return null;
  }
}

// ✅ Get all members
export async function getMembers() {
  try {
    const members = await db.member.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        parish: true,
        village: true,
      },
    });
    return members;
  } catch (error) {
    console.error("Error fetching members:", error);
    return null;
  }
}

// ✅ Get member by ID
export async function getMemberById(id: string) {
  try {
    const member = await db.member.findUnique({
      where: { id },
      include: {
        parish: true,
        village: true,
      },
    });
    return member;
  } catch (error) {
    console.error("Error fetching member by ID:", error);
    return null;
  }
}

// ✅ Update member
export async function updateMember(id: string, data: any) {
  try {
    const updatedMember = await db.member.update({
      where: { id },
      data,
    });
    revalidatePath("/dashboard/members");
    return updatedMember;
  } catch (error) {
    console.error("Error updating member:", error);
    return null;
  }
}

// ✅ Delete member
export async function deleteMember(id: string) {
  try {
    const member = await db.member.delete({
      where: { id },
    });
    revalidatePath("/dashboard/members");
    return { ok: true, data: member };
  } catch (error) {
    console.error("Error deleting member:", error);
    return null;
  }
}