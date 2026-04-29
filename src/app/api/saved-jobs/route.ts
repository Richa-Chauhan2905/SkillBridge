import { NextResponse } from "next/server";
import { db } from "@/src/db";
import { savedJobs, jobs } from "@/src/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { getAuthUser } from "@/src/lib/auth";

/* ================= POST ================= */
export const POST = async (req: Request) => {
  try {
    const user = await getAuthUser();

    if (user.role !== "FREELANCER") {
      return NextResponse.json(
        { success: false, message: "Only freelancers can save jobs" },
        { status: 401 },
      );
    }

    const { jobId } = await req.json();

    if (!jobId) {
      return NextResponse.json(
        { success: false, message: "Job ID is required" },
        { status: 400 },
      );
    }

    // ✅ Optional: prevent duplicate saves
    const existing = await db
      .select()
      .from(savedJobs)
      .where(and(eq(savedJobs.userId, user.id), eq(savedJobs.jobId, jobId)));

    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, message: "Job already saved" },
        { status: 409 },
      );
    }

    await db.insert(savedJobs).values({
      userId: user.id,
      jobId,
    });

    return NextResponse.json({
      success: true,
      message: "Job saved successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
};

/* ================= GET ================= */
export const GET = async () => {
  try {
    const user = await getAuthUser();

    if (user.role !== "FREELANCER") {
      return NextResponse.json(
        { success: false, message: "Only freelancers can view saved jobs" },
        { status: 401 },
      );
    }

    const result = await db
      .select({
        id: jobs.id,
        title: jobs.title,
        description: jobs.description,
        payPerHour: jobs.payPerHour,
        mandatorySkills: jobs.mandatorySkills,
        niceToHaveSkills: jobs.niceToHaveSkills,
        tools: jobs.tools,
        status: jobs.status,
        createdAt: jobs.createdAt,
        savedAt: savedJobs.savedAt,
      })
      .from(savedJobs)
      .leftJoin(jobs, eq(savedJobs.jobId, jobs.id))
      .where(eq(savedJobs.userId, user.id))
      .orderBy(desc(savedJobs.savedAt));

    // match Prisma output (only jobs array)
    const formatted = result.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      payPerHour: item.payPerHour,
      mandatorySkills: item.mandatorySkills,
      niceToHaveSkills: item.niceToHaveSkills,
      tools: item.tools,
      status: item.status,
      createdAt: item.createdAt,
    }));

    return NextResponse.json({
      success: true,
      savedJobs: formatted,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
};

/* ================= DELETE ================= */
export const DELETE = async (req: Request) => {
  try {
    const user = await getAuthUser();

    if (user.role !== "FREELANCER") {
      return NextResponse.json(
        { success: false, message: "Only freelancers can unsave jobs" },
        { status: 401 },
      );
    }

    const { jobId } = await req.json();

    if (!jobId) {
      return NextResponse.json(
        { success: false, message: "Job ID is required" },
        { status: 400 },
      );
    }

    const existing = await db
      .select({ id: savedJobs.id })
      .from(savedJobs)
      .where(and(eq(savedJobs.userId, user.id), eq(savedJobs.jobId, jobId)));

    if (existing.length === 0) {
      return NextResponse.json(
        { success: false, message: "Saved job not found" },
        { status: 404 },
      );
    }

    await db.delete(savedJobs).where(eq(savedJobs.id, existing[0].id));

    return NextResponse.json({
      success: true,
      message: "Job removed from saved list",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
};
