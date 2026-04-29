import { NextResponse } from "next/server";
import { db } from "@/src/db";
import { applications, jobs, users, clientProfiles } from "@/src/db/schema";
import { eq, desc } from "drizzle-orm";
import { getAuthUser } from "@/src/lib/auth";

export const GET = async () => {
  try {
    const user = await getAuthUser();

    /* ===== Role check ===== */

    if (user.role !== "FREELANCER") {
      return NextResponse.json(
        {
          success: false,
          message: "Only freelancers can view their applications",
        },
        { status: 403 }, // ✅ fixed
      );
    }

    /* ===== Fetch applications ===== */

    const result = await db
      .select({
        applicationId: applications.id,
        jobId: applications.jobId,
        applicationStatus: applications.status,
        appliedAt: applications.appliedAt,

        title: jobs.title,
        description: jobs.description,
        requiredExperience: jobs.requiredExperience,
        payPerHour: jobs.payPerHour,
        jobStatus: jobs.status,

        clientFirstName: users.firstName,
        clientLastName: users.lastName,
        companyName: clientProfiles.companyName,
      })
      .from(applications)
      .leftJoin(jobs, eq(applications.jobId, jobs.id))
      .leftJoin(users, eq(jobs.clientId, users.id))
      .leftJoin(clientProfiles, eq(clientProfiles.userId, users.id))
      .where(eq(applications.freelancerId, user.id))
      .orderBy(desc(applications.appliedAt));

    /* ===== Transform to match your Prisma response ===== */

    const applicationsData = result.map((r) => ({
      id: r.applicationId,
      jobId: r.jobId,
      status: r.applicationStatus,
      appliedAt: r.appliedAt,

      job: {
        title: r.title,
        description: r.description,
        requiredExperience: r.requiredExperience,
        payPerHour: r.payPerHour,
        status: r.jobStatus,

        client: {
          firstName: r.clientFirstName,
          lastName: r.clientLastName,
          clientProfile: {
            companyName: r.companyName,
          },
        },
      },
    }));

    return NextResponse.json({
      success: true,
      applications: applicationsData,
    });
  } catch (error) {
    console.error("Error fetching applications:", error);

    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
};
