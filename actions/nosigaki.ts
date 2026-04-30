"use server";

import { db } from "@/prisma/db";
import { revalidatePath } from "next/cache";

// Define Nosigaki props
export type NosigakiProps = {
  title: string;
  thumbnail?: string;
  videoUrl?: string;
  description?: string;
};

// ✅ Create new nosigaki
export async function createNosigaki(data: NosigakiProps) {
  try {
    const existingNosigaki = await db.nosigaki.findFirst({
      where: {
        title: data.title,
      },
    });

    if (existingNosigaki) {
      return existingNosigaki;
    }

    const newNosigaki = await db.nosigaki.create({
      data,
    });

    revalidatePath("/hoimacitywest");
    return newNosigaki;
  } catch (error) {
    console.error("Error creating nosigaki:", error);
    return null;
  }
}

// ✅ Get all nosigakis
export async function getNosigakis() {
  try {
    const nosigakis = await db.nosigaki.findMany({
      orderBy: { createdAt: "asc" },
    });
    return nosigakis;
  } catch (error) {
    console.error("Error fetching nosigakis:", error);
    return null;
  }
}

// ✅ Get nosigaki by ID
export async function getNosigakiById(id: string) {
  try {
    const nosigaki = await db.nosigaki.findUnique({
      where: { id },
    });
    return nosigaki;
  } catch (error) {
    console.error("Error fetching nosigaki by ID:", error);
    return null;
  }
}

// ✅ Update nosigaki
export async function updateNosigaki(id: string, data: NosigakiProps) {
  try {
    const updatedNosigaki = await db.nosigaki.update({
      where: { id },
      data,
    });
    revalidatePath("/dashboard/nosigaki");
    return updatedNosigaki;
  } catch (error) {
    console.error("Error updating nosigaki:", error);
    return null;
  }
}

// ✅ Delete nosigaki
export async function deleteNosigaki(id: string) {
  try {
    const nosigaki = await db.nosigaki.delete({
      where: { id },
    });
    revalidatePath("/dashboard/nosigaki");
    return { ok: true, data: nosigaki };
  } catch (error) {
    console.error("Error deleting nosigaki:", error);
    return null;
  }
}