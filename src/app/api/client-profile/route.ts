import { NextResponse, NextRequest } from "next/server";
import { db } from "@/src/db";
import { clientProfiles, users } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import { getAuthUser } from "@/src/lib/auth";

/* ================= GET PROFILE ================= */

export const GET = async () => {
  try {
    const user = await getAuthUser();

    const result = await db
      .select({
        id: clientProfiles.id,
        industry: clientProfiles.industry,
        companyName: clientProfiles.companyName,
        companyWebsite: clientProfiles.companyWebsite,
        linkedInProfile: clientProfiles.linkedInProfile,

        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
      })
      .from(clientProfiles)
      .leftJoin(users, eq(clientProfiles.userId, users.id))
      .where(eq(clientProfiles.userId, user.id));

    const profile = result[0];

    if (!profile) {
      return NextResponse.json(
        { success: false, error: "Profile not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        success: true,
        profile,
      },
      { status: 200 }, // ✅ FIXED (was 401 ❌)
    );
  } catch (error) {
    console.error("Error fetching recruiter profile:", error);

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
};

/* ================= CREATE / UPDATE ================= */

export const POST = async (req: NextRequest) => {
  try {
    const user = await getAuthUser();

    const { industry, companyName, companyWebsite, linkedInProfile } =
      await req.json();

    if (!industry) {
      return NextResponse.json(
        { success: false, error: "Missing required field: industry" },
        { status: 400 },
      );
    }

    // Check existing profile
    const existing = await db
      .select()
      .from(clientProfiles)
      .where(eq(clientProfiles.userId, user.id));

    const payload = {
      industry,
      companyName,
      companyWebsite,
      linkedInProfile,
      userId: user.id,
    };

    let profile;

    if (existing.length > 0) {
      // UPDATE
      const updated = await db
        .update(clientProfiles)
        .set(payload)
        .where(eq(clientProfiles.userId, user.id))
        .returning();

      profile = updated[0];
    } else {
      // CREATE
      const created = await db
        .insert(clientProfiles)
        .values(payload)
        .returning();

      profile = created[0];
    }

    return NextResponse.json(
      {
        success: true,
        profile,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating/updating recruiter profile:", error);

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
};
