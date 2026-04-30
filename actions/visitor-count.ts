"use server"

import { db } from "@/prisma/db"
import { revalidatePath } from "next/cache"

// Increment visit count (create if none exists)
export async function registerVisit() {
  try {
    // Find the first existing visit counter
    const existing = await db.visitCount.findFirst()

    if (existing) {
      const updated = await db.visitCount.update({
        where: { id: existing.id },
        data: {
          count: { increment: 1 },
        },
      })
      revalidatePath("/") // optional
      return updated.count
    }

    // If no record exists, create the initial one
    const created = await db.visitCount.create({
      data: { count: 1 },
    })

    revalidatePath("/") // optional
    return created.count
  } catch (error) {
    console.error("Error incrementing visit count:", error)
    return null
  }
}

// Fetch current count without incrementing
export async function getVisitCount() {
  try {
    const result = await db.visitCount.findFirst()
    return result?.count ?? 0
  } catch (error) {
    console.error("Error getting visit count:", error)
    return 0
  }
}
