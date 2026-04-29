import { NextResponse } from "next/server";
import { db } from "@/src/db";
import { applications, jobs, users, clientProfiles } from "@/src/db/schema";
import { eq, desc } from "drizzle-orm";
import { getAuthUser } from "@/src/lib/auth";

export const GET = async () => {
  try {
    const user = await getAuthUser();

    if (user.role !== "FREELANCER") {
      return NextResponse.json(
        { success: false, message: "Only freelancers can view applications" },
        { status: 403 },
      );
    }

    const result = await db
      .select({
        applicationId: applications.id,
        jobId: applications.jobId,
        status: applications.status,
        appliedAt: applications.appliedAt,

        // Job fields (include all needed by JobCard)
        jobTitle: jobs.title,
        jobDescription: jobs.description,
        requiredExperience: jobs.requiredExperience,
        payPerHour: jobs.payPerHour,
        jobStatus: jobs.status,
        mandatorySkills: jobs.mandatorySkills, // ✅ add
        niceToHaveSkills: jobs.niceToHaveSkills, // ✅ add
        tools: jobs.tools, // ✅ add
        preferredLocation: jobs.preferredLocation, // ✅ add
        clientLocation: jobs.clientLocation, // ✅ add
        createdAt: jobs.createdAt, // ✅ add

        // Client
        firstName: users.firstName,
        lastName: users.lastName,

        // Client Profile
        companyName: clientProfiles.companyName,
        industry: clientProfiles.industry,
      })
      .from(applications)
      .leftJoin(jobs, eq(applications.jobId, jobs.id))
      .leftJoin(users, eq(jobs.clientId, users.id))
      .leftJoin(clientProfiles, eq(users.id, clientProfiles.userId))
      .where(eq(applications.freelancerId, user.id))
      .orderBy(desc(applications.appliedAt));

    const formatted = result.map((item) => ({
      id: item.applicationId,
      status: item.status,
      appliedAt: item.appliedAt,

      job: {
        id: item.jobId,
        title: item.jobTitle,
        description: item.jobDescription,
        requiredExperience: item.requiredExperience,
        payPerHour: item.payPerHour,
        status: item.jobStatus,
        mandatorySkills: item.mandatorySkills ?? [], // ✅ ensure array
        niceToHaveSkills: item.niceToHaveSkills ?? [], // ✅ ensure array
        tools: item.tools ?? [], // ✅ ensure array
        preferredLocation: item.preferredLocation,
        clientLocation: item.clientLocation,
        createdAt: item.createdAt,

        client: {
          firstName: item.firstName,
          lastName: item.lastName,
          clientProfile: {
            companyName: item.companyName,
            industry: item.industry,
          },
        },
      },
    }));

    return NextResponse.json({
      success: true,
      applications: formatted,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
};
