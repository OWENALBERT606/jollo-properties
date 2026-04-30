import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import { requireOfficer } from "@/lib/auth-guard";
import { db } from "@/prisma/db";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const item = await db.workflowStep.findUnique({
    where: { id: params.id },
    include: {
      property: { select: { id: true, plotNumber: true, title: true, district: true } },
      transaction: { select: { id: true, type: true, status: true, property: { select: { title: true } } } },
      assignee: { select: { id: true, name: true, email: true } },
    },
  });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const current = await db.workflowStep.findUnique({ where: { id: params.id } });
    if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const updateData: any = {};

    // Status transition
    if (body.status) {
      // Check if user is assignee or admin
      if (current.assigneeId && current.assigneeId !== session.user.id && session.user.role !== "ADMIN") {
        return NextResponse.json({ error: "Only the assignee can update this step" }, { status: 403 });
      }
      updateData.status = body.status;
      updateData.completedAt = new Date();
    }

    if (body.assigneeId) updateData.assigneeId = body.assigneeId;
    if (body.notes !== undefined) updateData.notes = body.notes;

    const item = await db.workflowStep.update({ where: { id: params.id }, data: updateData });
    return NextResponse.json(item);
  } catch (err: any) {
    if (err.code === "P2025") return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  const guard = requireOfficer(session);
  if (guard) return guard;

  try {
    const step = await db.workflowStep.findUnique({ where: { id: params.id } });
    if (!step) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Only delete if still pending
    if (step.status !== "PENDING") {
      return NextResponse.json({ error: "Cannot delete: step already completed" }, { status: 400 });
    }

    await db.workflowStep.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    if (err.code === "P2025") return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}