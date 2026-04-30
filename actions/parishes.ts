"use server";

import { db } from "@/prisma/db";
import { revalidatePath } from "next/cache";

// Define Parish props
export type ParishProps = {
  name: string;
  description: string;
  population: number;
};

// ✅ Create new parish
export async function createParish(data: ParishProps) {
  try {
    const existing = await db.parish.findUnique({
      where: { name: data.name },
    });

    if (existing) {
      return existing;
    }

    const newParish = await db.parish.create({
      data,
    });

    revalidatePath("/dashboard/parishes");
    return newParish;
  } catch (error) {
    console.error("Error creating parish:", error);
    return null;
  }
}

// ✅ Get all parishes
export async function getParishes() {
  try {
    const parishes = await db.parish.findMany({
      orderBy: { createdAt: "asc" },
      include: {
        villages: true,
        members: true,
      },
    });
    return parishes;
  } catch (error) {
    console.error("Error fetching parishes:", error);
    return null;
  }
}

// ✅ Get parish by ID
export async function getParishById(id: string) {
  try {
    const parish = await db.parish.findUnique({
      where: { id },
      include: {
        villages: true,
        members: true,
      },
    });
    return parish;
  } catch (error) {
    console.error("Error fetching parish by ID:", error);
    return null;
  }
}

// ✅ Update parish
export async function updateParish(id: string, data: ParishProps) {
  try {
    const updatedParish = await db.parish.update({
      where: { id },
      data,
    });
    revalidatePath("/dashboard/parishes");
    return updatedParish;
  } catch (error) {
    console.error("Error updating parish:", error);
    return null;
  }
}

// ✅ Delete parish
export async function deleteParish(id: string) {
  try {
    const parish = await db.parish.delete({
      where: { id },
    });
    revalidatePath("/dashboard/parishes");
    return { ok: true, data: parish };
  } catch (error) {
    console.error("Error deleting parish:", error);
    return null;
  }
}
