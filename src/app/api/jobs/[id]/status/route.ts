import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/db";
import { jobs } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { getAuthUser } from "@/src/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }, // ← Promise
) {
  try {
    const user = await getAuthUser();

    if (user.role !== "CLIENT") {
      return NextResponse.json(
        { success: false, error: "Only clients can update job status" },
        { status: 403 },
      );
    }

    const { id: jobId } = await params; // ← await params
    const { status } = await req.json();

    const validStatuses = ["OPEN", "CLOSED", "FILLED"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: "Invalid job status" },
        { status: 400 },
      );
    }

    const existingJob = await db
      .select({ id: jobs.id, clientId: jobs.clientId })
      .from(jobs)
      .where(eq(jobs.id, jobId));

    if (existingJob.length === 0) {
      return NextResponse.json(
        { success: false, error: "Job not found" },
        { status: 404 },
      );
    }

    if (existingJob[0].clientId !== user.id) {
      return NextResponse.json(
        { success: false, error: "You can update only your own job" },
        { status: 403 },
      );
    }

    const updatedJob = await db
      .update(jobs)
      .set({ status: status as (typeof jobs.$inferInsert)["status"] })
      .where(eq(jobs.id, jobId))
      .returning({ id: jobs.id, status: jobs.status });

    return NextResponse.json(
      { success: true, job: updatedJob[0] },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error updating job status:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
