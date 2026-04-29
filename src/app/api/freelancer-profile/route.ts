import { NextResponse, NextRequest } from "next/server";
import { db } from "@/src/db";
import { freelancerProfiles, users } from "@/src/db/schema";
import { eq } from "drizzle-orm";
import {cloudinary} from "@/src/lib/cloudinary";
import { getAuthUser } from "@/src/lib/auth";

/* ================= GET ================= */

export const GET = async () => {
  try {
    const user = await getAuthUser();

    const result = await db
      .select({
        id: freelancerProfiles.id,
        industry: freelancerProfiles.industry,
        experience: freelancerProfiles.experience,
        education: freelancerProfiles.education,
        bio: freelancerProfiles.bio,
        ratePerHour: freelancerProfiles.ratePerHour,
        DOB: freelancerProfiles.DOB,
        contact: freelancerProfiles.contact,
        city: freelancerProfiles.city,
        state: freelancerProfiles.state,
        pincode: freelancerProfiles.pincode,
        skills: freelancerProfiles.skills,
        languages: freelancerProfiles.languages,
        resume: freelancerProfiles.resume,
        createdAt: freelancerProfiles.createdAt,

        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
      })
      .from(freelancerProfiles)
      .leftJoin(users, eq(freelancerProfiles.userId, users.id))
      .where(eq(freelancerProfiles.userId, user.id));

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
      { status: 200 },
    );
  } catch (error) {
    console.error("Error fetching freelancer profile:", error);

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
};

/* ================= POST ================= */

export const POST = async (req: NextRequest) => {
  try {
    const user = await getAuthUser();

    const formData = await req.formData();

    const resume = formData.get("resume") as File;
    const industry = formData.get("industry") as string;
    const skillsString = formData.get("skills") as string;
    const experience = formData.get("experience") as string;
    const education = formData.get("education") as string;
    const languagesString = formData.get("languages") as string;
    const bio = formData.get("bio") as string;
    const ratePerHourString = formData.get("ratePerHour") as string;
    const DOB = formData.get("DOB") as string;
    const city = formData.get("city") as string;
    const state = formData.get("state") as string;
    const pincodeString = formData.get("pincode") as string;
    const contact = formData.get("contact") as string;

    let skills: string[] = [];
    let languages: string[] = [];

    try {
      skills = JSON.parse(skillsString || "[]");
      languages = JSON.parse(languagesString || "[]");
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "skills and languages must be valid JSON arrays",
        },
        { status: 400 },
      );
    }

    if (!skills.length || !languages.length) {
      return NextResponse.json(
        { success: false, error: "skills and languages cannot be empty" },
        { status: 400 },
      );
    }

    const ratePerHour = Number(ratePerHourString);
    const pincodeNumber = parseInt(pincodeString, 10);

    if (isNaN(ratePerHour) || ratePerHour <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid rate per hour" },
        { status: 400 },
      );
    }

    if (isNaN(pincodeNumber) || pincodeNumber <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid pincode" },
        { status: 400 },
      );
    }

    // ✅ Manual enum validation (Drizzle)
    const validIndustries = [
      "IT",
      "HEALTHCARE",
      "EDUCATION",
      "REAL_ESTATE",
      "HOSPITALITY",
      "RETAIL",
      "E_COMMERCE",
      "LEGAL",
      "CONSULTING",
      "MANUFACTURING",
      "TRANSPORTATION",
      "LOGISTICS",
      "MEDIA",
      "ENTERTAINMENT",
      "PUBLIC_SECTOR",
      "NON_PROFIT",
      "ENGINEERING",
      "BIOTECH",
      "PHARMACEUTICAL",
      "AGRICULTURE",
      "ENERGY",
      "TELECOMMUNICATION",
      "SECURITY",
      "CYBERSECURITY",
      "GAMING",
      "SPORTS",
      "AUTOMOTIVE",
      "AEROSPACE",
    ];

    const validExperiences = ["BEGINNER", "INTERMEDIATE", "EXPERT"];

    if (!validIndustries.includes(industry)) {
      return NextResponse.json(
        { success: false, error: "Invalid industry" },
        { status: 400 },
      );
    }

    if (!validExperiences.includes(experience)) {
      return NextResponse.json(
        { success: false, error: "Invalid experience" },
        { status: 400 },
      );
    }

    const dobDate = new Date(DOB);
    if (isNaN(dobDate.getTime())) {
      return NextResponse.json(
        { success: false, error: "Invalid DOB" },
        { status: 400 },
      );
    }

    /* ===== Upload to Cloudinary ===== */

    const bytes = await resume.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadResult: any = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "resumes",
            resource_type: "raw",
            public_id: `resume_${user.id}_${Date.now()}`, // ✅ FIXED
          },
          (err, result) => {
            if (err) reject(err);
            else resolve(result);
          },
        )
        .end(buffer);
    });

    const resumeUrl = uploadResult.secure_url;

    /* ===== Check existing profile ===== */

    const existing = await db
      .select()
      .from(freelancerProfiles)
      .where(eq(freelancerProfiles.userId, user.id));

    const payload = {
      resume: resumeUrl,
      industry:
        industry as (typeof freelancerProfiles.$inferInsert)["industry"],
      experience:
        experience as (typeof freelancerProfiles.$inferInsert)["experience"],
      skills,
      education,
      languages,
      bio,
      ratePerHour,
      DOB: dobDate,
      city,
      state,
      pincode: pincodeNumber,
      contact,
      userId: user.id,
    };

    let profile;

    if (existing.length > 0) {
      const updated = await db
        .update(freelancerProfiles)
        .set(payload)
        .where(eq(freelancerProfiles.userId, user.id))
        .returning();

      profile = updated[0];
    } else {
      const created = await db
        .insert(freelancerProfiles)
        .values(payload)
        .returning();

      profile = created[0];
    }

    return NextResponse.json(
      {
        success: true,
        profile,
      },
      { status: existing.length > 0 ? 200 : 201 },
    );
  } catch (error: any) {
    console.error("Error in freelancer profile API:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal server error",
      },
      { status: 500 },
    );
  }
};
