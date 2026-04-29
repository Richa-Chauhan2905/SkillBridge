import { NextResponse } from "next/server";
import { db } from "@/src/db";
import { jobs } from "@/src/db/schema";
import { eq, desc } from "drizzle-orm";
import { getAuthUser } from "@/src/lib/auth";

export const GET = async () => {
  try {
    const user = await getAuthUser();

    if (user.role !== "CLIENT") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    const clientJobs = await db
      .select({
        id: jobs.id,
        title: jobs.title,
        description: jobs.description,
        payPerHour: jobs.payPerHour,
        requiredExperience: jobs.requiredExperience,
        status: jobs.status,
        mandatorySkills: jobs.mandatorySkills,
        niceToHaveSkills: jobs.niceToHaveSkills,
        tools: jobs.tools,
        preferredLocation: jobs.preferredLocation,
        clientLocation: jobs.clientLocation,
        createdAt: jobs.createdAt,
      })
      .from(jobs)
      .where(eq(jobs.clientId, user.id))
      .orderBy(desc(jobs.createdAt));

    const transformedJobs = clientJobs.map((job) => ({
      ...job,
      mandatorySkills: job.mandatorySkills ?? [],
      niceToHaveSkills: job.niceToHaveSkills ?? [],
      tools: job.tools ?? [],
      applicationsCount: 0, // You can join applications table later to get real count
    }));

    return NextResponse.json({
      success: true,
      clientJobs: transformedJobs, // ✅ key matches frontend
      pagination: {
        // ✅ frontend expects this
        totalJobs: transformedJobs.length,
        totalPages: 1,
        currentPage: 1,
        hasNextPage: false,
        hasPrevPage: false,
      },
    });
  } catch (error) {
    console.error("Error fetching client jobs:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
};
