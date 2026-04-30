import { db } from "@/prisma/db";

interface AuditParams {
  actorId?: string;
  action: string;
  entityType: string;
  entityId: string;
  propertyId?: string;
  transactionId?: string;
  oldValue?: object;
  newValue?: object;
  ip?: string;
}

/**
 * Writes an immutable AuditLog entry. Fire-and-forget — errors are logged
 * to console but never thrown to avoid breaking the main request.
 */
export async function writeAudit(params: AuditParams): Promise<void> {
  try {
    await db.auditLog.create({
      data: {
        actorId: params.actorId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        propertyId: params.propertyId,
        transactionId: params.transactionId,
        oldValue: params.oldValue as any,
        newValue: params.newValue as any,
        ip: params.ip,
      },
    });
  } catch (err) {
    console.error("[AuditLog] Failed to write audit entry:", err);
  }
}

/** Extract client IP from Next.js request headers */
export function getClientIp(req: Request): string | undefined {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? undefined;
}
