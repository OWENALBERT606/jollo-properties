import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import { db } from "@/prisma/db";
import { getPresignedDownloadUrl } from "@/lib/r2";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const doc = await db.document.findUnique({ where: { id: (await params).id } });
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const url = await getPresignedDownloadUrl(doc.r2Key);
  return NextResponse.json({ url });
}
