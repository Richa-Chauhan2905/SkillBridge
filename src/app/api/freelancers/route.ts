import { NextResponse } from "next/server";
import { db } from "@/src/db";
import { clientProfiles, freelancerProfiles, users } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { getAuthUser } from "@/src/lib/auth";

export const GET = async () => {
  try {
    const user = await getAuthUser();

    if (!user || user.role !== "CLIENT") {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    // 1. Fetch all freelancers (no conditional where)
    const freelancers = await db
      .select({
        id: freelancerProfiles.id,
        userId: freelancerProfiles.userId,
        ratePerHour: freelancerProfiles.ratePerHour,
        city: freelancerProfiles.city,
        state: freelancerProfiles.state,
        DOB: freelancerProfiles.DOB,
        experience: freelancerProfiles.experience,
        industry: freelancerProfiles.industry,
        bio: freelancerProfiles.bio,
        education: freelancerProfiles.education,
        skills: freelancerProfiles.skills,
        languages: freelancerProfiles.languages,
        resume: freelancerProfiles.resume,
        pincode: freelancerProfiles.pincode,
        contact: freelancerProfiles.contact,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
      })
      .from(freelancerProfiles)
      .leftJoin(users, eq(freelancerProfiles.userId, users.id));

    // 2. Get client's industry (optional filter)
    const clientResult = await db
      .select({ industry: clientProfiles.industry })
      .from(clientProfiles)
      .where(eq(clientProfiles.userId, user.id));

    let filteredFreelancers = freelancers;
    if (clientResult.length > 0 && clientResult[0].industry) {
      const clientIndustry = clientResult[0].industry;
      filteredFreelancers = freelancers.filter(
        (f) => f.industry === clientIndustry,
      );
    }

    // 3. Transform to match frontend expectation
    const transformedFreelancers = filteredFreelancers.map((f) => ({
      id: f.id,
      firstName: f.firstName,
      lastName: f.lastName,
      email: f.email,
      industry: f.industry,
      skills: f.skills || [],
      experience: f.experience,
      education: f.education || "",
      bio: f.bio || "",
      resume: f.resume,
      ratePerHour: f.ratePerHour,
      city: f.city,
      state: f.state,
      contact: f.contact || "",
      languages: f.languages || [],
      DOB: f.DOB,
      pincode: f.pincode,
    }));

    return NextResponse.json({
      success: true,
      transformedFreelancers, // ✅ matches frontend clientFeed.tsx
    });
  } catch (error: any) {
    console.error("Error fetching freelancers:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
};
