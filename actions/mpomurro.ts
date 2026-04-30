"use server";

import { db } from "@/prisma/db";
import { revalidatePath } from "next/cache";

// Define Mpomurro props
export type MpomurroProps = {
  title: string;
  thumbnail?: string;
  videoUrl?: string;
  description?: string;
};

// ✅ Create new mpomurro
export async function createMpomurro(data: MpomurroProps) {
  try {
    const existingMpomurro = await db.mpomurro.findFirst({
      where: {
        title: data.title,
      },
    });

    if (existingMpomurro) {
      return existingMpomurro;
    }

    const newMpomurro = await db.mpomurro.create({
      data,
    });

    revalidatePath("/hoimacitywest");
    return newMpomurro;
  } catch (error) {
    console.error("Error creating mpomurro:", error);
    return null;
  }
}

// ✅ Get all mpomurros
export async function getMpomurros() {
  try {
    const mpomurros = await db.mpomurro.findMany({
      orderBy: { createdAt: "asc" },
    });
    return mpomurros;
  } catch (error) {
    console.error("Error fetching mpomurros:", error);
    return null;
  }
}

// ✅ Get mpomurro by ID
export async function getMpomurroById(id: string) {
  try {
    const mpomurro = await db.mpomurro.findUnique({
      where: { id },
    });
    return mpomurro;
  } catch (error) {
    console.error("Error fetching mpomurro by ID:", error);
    return null;
  }
}

// ✅ Update mpomurro
export async function updateMpomurro(id: string, data: MpomurroProps) {
  try {
    const updatedMpomurro = await db.mpomurro.update({
      where: { id },
      data,
    });
    revalidatePath("/dashboard/mpomurro");
    return updatedMpomurro;
  } catch (error) {
    console.error("Error updating mpomurro:", error);
    return null;
  }
}

// ✅ Delete mpomurro
export async function deleteMpomurro(id: string) {
  try {
    const mpomurro = await db.mpomurro.delete({
      where: { id },
    });
    revalidatePath("/dashboard/mpomurro");
    return { ok: true, data: mpomurro };
  } catch (error) {
    console.error("Error deleting mpomurro:", error);
    return null;
  }
}
