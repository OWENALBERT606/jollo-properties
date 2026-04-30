"use server";

import { db } from "@/prisma/db";
import { revalidatePath } from "next/cache";

// Define Promise props
export type PromiseProps = {
  title: string;
  why: string;
  solution: string;
  commitments: string[];
  impact: string;
};

// ✅ Create new promise
export async function createPromise(data: PromiseProps) {
  try {
    const existing = await db.promise.findUnique({
      where: { title: data.title },
    });

    if (existing) {
      return existing;
    }

    const newPromise = await db.promise.create({
      data,
    });

    revalidatePath("/dashboard/promises");
    return newPromise;
  } catch (error) {
    console.error("Error creating promise:", error);
    return null;
  }
}

// ✅ Get all promises
export async function getPromises() {
  try {
    const promises = await db.promise.findMany({
      orderBy: { createdAt: "desc" },
    });
    return promises;
  } catch (error) {
    console.error("Error fetching promises:", error);
    return null;
  }
}

// ✅ Get promise by ID
export async function getPromiseById(id: string) {
  try {
    const promise = await db.promise.findUnique({
      where: { id },
    });
    return promise;
  } catch (error) {
    console.error("Error fetching promise by ID:", error);
    return null;
  }
}

// ✅ Update promise
export async function updatePromise(id: string, data: PromiseProps) {
  try {
    const updatedPromise = await db.promise.update({
      where: { id },
      data,
    });
    revalidatePath("/dashboard/promises");
    return updatedPromise;
  } catch (error) {
    console.error("Error updating promise:", error);
    return null;
  }
}

// ✅ Delete promise
export async function deletePromise(id: string) {
  try {
    const promise = await db.promise.delete({
      where: { id },
    });
    revalidatePath("/dashboard/promises");
    return { ok: true, data: promise };
  } catch (error) {
    console.error("Error deleting promise:", error);
    return null;
  }
}