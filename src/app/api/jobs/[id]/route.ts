import { NextResponse, NextRequest } from "next/server";
import { db } from "@/src/db";
import { jobs, users, clientProfiles, applications } from "@/src/db/schema";
import { eq, count } from "drizzle-orm";

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  try {
    const { id: jobId } = await params;

    if (!jobId) {
      return NextResponse.json(
        { success: false, error: "Job ID is required" },
        { status: 400 },
      );
    }

    const result = await db
      .select({
        id: jobs.id,
        title: jobs.title,
        description: jobs.description,
        createdAt: jobs.createdAt,
        payPerHour: jobs.payPerHour,
        requiredExperience: jobs.requiredExperience,
        mandatorySkills: jobs.mandatorySkills,
        niceToHaveSkills: jobs.niceToHaveSkills,
        tools: jobs.tools,
        preferredLocation: jobs.preferredLocation,
        preferredEducation: jobs.preferredEducation,
        clientLocation: jobs.clientLocation,
        status: jobs.status,
        clientId: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        industry: clientProfiles.industry,
        companyName: clientProfiles.companyName,
        companyWebsite: clientProfiles.companyWebsite,
        linkedInProfile: clientProfiles.linkedInProfile,
        applicationsCount: count(applications.id),
      })
      .from(jobs)
      .leftJoin(users, eq(jobs.clientId, users.id))
      .leftJoin(clientProfiles, eq(clientProfiles.userId, users.id))
      .leftJoin(applications, eq(applications.jobId, jobs.id))
      .where(eq(jobs.id, jobId))
      .groupBy(jobs.id, users.id, clientProfiles.id);

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, error: "Job not found" },
        { status: 404 },
      );
    }

    const job = result[0];
    const { firstName, lastName, clientId, ...rest } = job;

    return NextResponse.json(
      {
        success: true,
        job: {
          ...rest,
          clientId,
          client: {
            id: clientId,
            firstName,
            lastName,
          },
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching job:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
};
