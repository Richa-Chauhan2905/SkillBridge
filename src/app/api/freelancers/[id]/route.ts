import { NextRequest, NextResponse } from "next/server";
import { db } from "@/src/db";
import { freelancerProfiles, users } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { getAuthUser } from "@/src/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getAuthUser();
    const { id: profileId } = await params; // This is the freelancer profile ID

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );
    }

    if (user.role !== "CLIENT") {
      return NextResponse.json(
        {
          success: false,
          message: "Only clients can view freelancer profiles",
        },
        { status: 403 },
      );
    }

    // Query by freelancer profile ID, not user ID
    const result = await db
      .select({
        id: freelancerProfiles.id,
        userId: freelancerProfiles.userId,
        industry: freelancerProfiles.industry,
        skills: freelancerProfiles.skills,
        experience: freelancerProfiles.experience,
        education: freelancerProfiles.education,
        bio: freelancerProfiles.bio,
        ratePerHour: freelancerProfiles.ratePerHour,
        DOB: freelancerProfiles.DOB,
        city: freelancerProfiles.city,
        state: freelancerProfiles.state,
        pincode: freelancerProfiles.pincode,
        contact: freelancerProfiles.contact,
        languages: freelancerProfiles.languages,
        resume: freelancerProfiles.resume,
        createdAt: freelancerProfiles.createdAt,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
      })
      .from(freelancerProfiles)
      .leftJoin(users, eq(freelancerProfiles.userId, users.id))
      .where(eq(freelancerProfiles.id, profileId)); // ← changed to profile ID

    if (result.length === 0) {
      return NextResponse.json(
        { success: false, message: "Freelancer not found" },
        { status: 404 },
      );
    }

    const f = result[0];
    const freelancer = {
      id: f.id,
      userId: f.userId,
      industry: f.industry,
      skills: f.skills || [],
      experience: f.experience,
      education: f.education || "",
      bio: f.bio || "",
      ratePerHour: f.ratePerHour,
      DOB: f.DOB,
      city: f.city,
      state: f.state,
      pincode: f.pincode,
      contact: f.contact || "",
      languages: f.languages || [],
      resume: f.resume,
      createdAt: f.createdAt,
      user: {
        firstName: f.firstName,
        lastName: f.lastName,
        email: f.email,
      },
    };

    return NextResponse.json({ success: true, freelancer }, { status: 200 });
  } catch (error) {
    console.error("Error fetching freelancer:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
