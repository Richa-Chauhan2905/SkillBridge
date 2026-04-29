import { NextResponse, NextRequest } from "next/server";
import { db } from "@/src/db";
import { applications, users, freelancerProfiles } from "@/src/db/schema";
import { eq, desc } from "drizzle-orm";
import { getAuthUser } from "@/src/lib/auth";

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  try {
    const user = await getAuthUser();
    const { id: jobId } = await params;

    if (user.role !== "CLIENT") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    // Fetch flat data (no nested objects)
    const flatData = await db
      .select({
        id: applications.id,
        status: applications.status,
        appliedAt: applications.appliedAt,
        freelancerId: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        industry: freelancerProfiles.industry,
        skills: freelancerProfiles.skills,
        experience: freelancerProfiles.experience,
        ratePerHour: freelancerProfiles.ratePerHour,
        city: freelancerProfiles.city,
        state: freelancerProfiles.state,
        bio: freelancerProfiles.bio,
      })
      .from(applications)
      .leftJoin(users, eq(applications.freelancerId, users.id))
      .leftJoin(freelancerProfiles, eq(freelancerProfiles.userId, users.id))
      .where(eq(applications.jobId, jobId))
      .orderBy(desc(applications.appliedAt));

    // Transform to match frontend interface
    const transformedApplications = flatData.map((row) => ({
      id: row.id,
      status: row.status,
      appliedAt: row.appliedAt,
      freelancer: {
        id: row.freelancerId,
        firstName: row.firstName,
        lastName: row.lastName,
        email: row.email,
        freelancerProfile: {
          industry: row.industry,
          skills: row.skills ?? [],
          experience: row.experience,
          ratePerHour: row.ratePerHour,
          city: row.city,
          state: row.state,
          bio: row.bio,
        },
      },
    }));

    return NextResponse.json({
      success: true,
      applications: transformedApplications,
    });
  } catch (error) {
    console.error("Error fetching applications:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
};
