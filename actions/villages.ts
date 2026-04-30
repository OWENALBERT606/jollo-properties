"use server";

import { db } from "@/prisma/db";
import { revalidatePath } from "next/cache";

// Define Village props
export type VillageProps = {
  name: string;
  description: string;
  population: number;
  parishId: string;
  houseHolds?: number;
};

// ✅ Create new village
export async function createVillage(data: VillageProps) {
  try {
    const existing = await db.village.findUnique({
      where: { name: data.name },
    });

    if (existing) {
      return existing;
    }

    const newVillage = await db.village.create({
      data: {
        name: data.name,
        description: data.description,
        population: data.population,
        parishId: data.parishId,
        houseHolds: data.houseHolds ?? 0,
      },
    });

    revalidatePath("/dashboard/villages");
    return newVillage;
  } catch (error) {
    console.error("Error creating village:", error);
    return null;
  }
}

// ✅ Get all villages
export async function getVillages() {
  try {
    const villages = await db.village.findMany({
      orderBy: { createdAt: "asc" },
      include: {
        parish: true,
        members: true,
      },
    });
    return villages;
  } catch (error) {
    console.error("Error fetching villages:", error);
    return null;
  }
}

// ✅ Get village by ID
export async function getVillageById(id: string) {
  try {
    const village = await db.village.findUnique({
      where: { id },
      include: {
        parish: true,
        members: true,
      },
    });
    return village;
  } catch (error) {
    console.error("Error fetching village by ID:", error);
    return null;
  }
}

// ✅ Update village
export async function updateVillage(id: string, data: VillageProps) {
  try {
    const updatedVillage = await db.village.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        population: data.population,
        parishId: data.parishId,
        houseHolds: data.houseHolds ?? 0,
      },
    });
    revalidatePath("/dashboard/villages");
    return updatedVillage;
  } catch (error) {
    console.error("Error updating village:", error);
    return null;
  }
}

// ✅ Delete village
export async function deleteVillage(id: string) {
  try {
    const village = await db.village.delete({
      where: { id },
    });
    revalidatePath("/dashboard/villages");
    return { ok: true, data: village };
  } catch (error) {
    console.error("Error deleting village:", error);
    return null;
  }
}
