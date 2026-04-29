import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/db";
import { applications, jobs, notifications } from "@/src/db/schema";
import { eq, ne, and } from "drizzle-orm";
import { getAuthUser } from "@/src/lib/auth";

export const PATCH = async (
  req: NextRequest,
  { params }: { params: { applicationId?: string } },
) => {
  try {
    const user = await getAuthUser();

    // ✅ Role check
    if (user.role !== "CLIENT") {
      return NextResponse.json(
        { success: false, error: "Only clients can update applications" },
        { status: 403 },
      );
    }

    const applicationId = params.applicationId;

    if (!applicationId) {
      return NextResponse.json(
        { success: false, error: "Application ID missing" },
        { status: 400 },
      );
    }

    const { status } = await req.json();

    if (!["ACCEPTED", "REJECTED"].includes(status)) {
      return NextResponse.json(
        { success: false, error: "Invalid status" },
        { status: 400 },
      );
    }

    // ✅ Fetch application + job
    const existing = await db
      .select({
        id: applications.id,
        jobId: applications.jobId,
        freelancerId: applications.freelancerId,
        clientId: jobs.clientId,
      })
      .from(applications)
      .leftJoin(jobs, eq(applications.jobId, jobs.id))
      .where(eq(applications.id, applicationId));

    if (existing.length === 0) {
      return NextResponse.json(
        { success: false, error: "Application not found" },
        { status: 404 },
      );
    }

    const app = existing[0];

    // ✅ IMPORTANT: Fix null issue
    if (!app.jobId) {
      return NextResponse.json(
        { success: false, error: "Invalid job reference" },
        { status: 400 },
      );
    }

    const jobId = app.jobId; // ✅ now it's string (not null)

    if (app.clientId !== user.id) {
      return NextResponse.json(
        { success: false, error: "Not your job" },
        { status: 403 },
      );
    }

    // ✅ Transaction
    await db.transaction(async (tx) => {
      // 1️⃣ Update selected application
      await tx
        .update(applications)
        .set({ status })
        .where(eq(applications.id, applicationId));

      if (status === "ACCEPTED") {
        // 2️⃣ Mark job as FILLED
        await tx
          .update(jobs)
          .set({ status: "FILLED" })
          .where(eq(jobs.id, jobId)); // ✅ FIXED

        // 3️⃣ Reject other applications
        await tx
          .update(applications)
          .set({ status: "REJECTED" })
          .where(
            and(
              eq(applications.jobId, jobId),
              ne(applications.id, applicationId),
            ),
          ); // ✅ FIXED (no multiple where)

        // 4️⃣ Send notification
        if (app.freelancerId) {
          await tx.insert(notifications).values({
            userId: app.freelancerId,
            type: "JOB",
            title: "You’ve been hired 🎉",
            description:
              "Congratulations! You were hired for a job you applied to.",
          });
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH application status error:", error);

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
};
