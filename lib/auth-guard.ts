import { NextResponse } from "next/server";
import type { Session } from "next-auth";
import type { UserRole } from "@prisma/client";

/**
 * Returns a 401 NextResponse if the session is missing or the user's role
 * is not in the allowed list. Returns null if access is granted.
 */
export function requireRole(
  session: Session | null,
  ...roles: UserRole[]
): NextResponse | null {
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!roles.includes(session.user.role as UserRole)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}

/** Shorthand for ADMIN-only routes */
export function requireAdmin(session: Session | null): NextResponse | null {
  return requireRole(session, "ADMIN");
}

/** Shorthand for ADMIN or LAND_OFFICER routes */
export function requireOfficer(session: Session | null): NextResponse | null {
  return requireRole(session, "ADMIN", "LAND_OFFICER");
}
