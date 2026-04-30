import { db } from "@/prisma/db";

/**
 * Generates a unique receipt number in the format RCP-YYYYMMDD-XXXX
 * where XXXX is a zero-padded sequential count of payments created today + 1.
 */
export async function generateReceiptNumber(): Promise<string> {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, ""); // YYYYMMDD

  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(startOfDay.getTime() + 86400000);

  const count = await db.taxPayment.count({
    where: { paidAt: { gte: startOfDay, lt: endOfDay } },
  });

  const seq = String(count + 1).padStart(4, "0");
  return `RCP-${dateStr}-${seq}`;
}
