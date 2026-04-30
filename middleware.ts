import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Admin-only routes
const ADMIN_ROUTES = [
  "/dashboard/admin-home", "/dashboard/users", "/dashboard/properties",
  "/dashboard/reports", "/dashboard/categories", "/dashboard/tenures",
  "/dashboard/districts", "/dashboard/regions", "/dashboard/roads",
];

// Officer + Admin routes
const OFFICER_ROUTES = [
  "/dashboard/officer-home", "/dashboard/register", "/dashboard/transactions",
  "/dashboard/owners", "/dashboard/valuations", "/dashboard/disputes", "/dashboard/map",
];

// Public user routes
const USER_ROUTES = [
  "/dashboard/user-home", "/dashboard/my-properties",
  "/dashboard/my-transactions", "/dashboard/documents",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/dashboard")) return NextResponse.next();

  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", request.url);
    return NextResponse.redirect(loginUrl);
  }

  const role = token.role as string;

  if (ADMIN_ROUTES.some((r) => pathname.startsWith(r)) && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  if (OFFICER_ROUTES.some((r) => pathname.startsWith(r)) && role !== "LAND_OFFICER" && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  if (USER_ROUTES.some((r) => pathname.startsWith(r)) && role !== "PUBLIC_USER" && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
