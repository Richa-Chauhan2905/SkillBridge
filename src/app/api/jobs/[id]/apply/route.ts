import { NextResponse, NextRequest } from "next/server";
import { db } from "@/src/db";
import { jobs, applications } from "@/src/db/schema";
import { eq, and } from "drizzle-orm";
import { getAuthUser } from "@/src/lib/auth";

export const POST = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  try {
    const user = await getAuthUser();
    const { id: jobId } = await params; // ✅ await params and destructure

    /* ===== Role check ===== */
    if (user.role !== "FREELANCER") {
      return NextResponse.json(
        { success: false, message: "Only freelancers can apply" },
        { status: 403 },
      );
    }

    /* ===== Check job exists ===== */
    const jobResult = await db
      .select({ id: jobs.id, status: jobs.status })
      .from(jobs)
      .where(eq(jobs.id, jobId)); // ✅ jobId is now a string

    if (jobResult.length === 0) {
      return NextResponse.json(
        { success: false, message: "Job not found" },
        { status: 404 },
      );
    }

    const job = jobResult[0];
    if (job.status !== "OPEN") {
      return NextResponse.json(
        { success: false, message: "Cannot apply to closed jobs" },
        { status: 400 },
      );
    }

    /* ===== Check duplicate application ===== */
    const existingApplication = await db
      .select()
      .from(applications)
      .where(
        and(
          eq(applications.jobId, jobId),
          eq(applications.freelancerId, user.id),
        ),
      );

    if (existingApplication.length > 0) {
      return NextResponse.json(
        { success: false, message: "Already applied to this job" },
        { status: 409 },
      );
    }

    /* ===== Create application ===== */
    const newApplication = await db
      .insert(applications)
      .values({
        jobId,
        freelancerId: user.id,
      })
      .returning();

    return NextResponse.json(
      {
        success: true,
        message: "Applied successfully",
        application: newApplication[0],
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error applying to job:", error);
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 },
    );
  }
};
