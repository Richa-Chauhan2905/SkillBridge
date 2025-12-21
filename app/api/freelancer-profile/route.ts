import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/app";
import cloudinary from "@/lib/cloudinary";
import { Industry, Experience } from "@/app/generated/prisma/enums";
import { getAuthUser } from "@/lib/auth";

export const GET = async () => {
  try {
    const user = await getAuthUser();

    const profile = await prisma.freelancerProfile.findUnique({
      where: { userId: user.id },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!profile) {
      return NextResponse.json(
        { success: false, error: "Profile not found" },
        { status: 404 }
      );
    }

    // Send full profile including resume URL
    return NextResponse.json(
      {
        success: true,
        profile: {
          id: profile.id,
          industry: profile.industry,
          experience: profile.experience,
          education: profile.education,
          bio: profile.bio,
          ratePerHour: profile.ratePerHour,
          DOB: profile.DOB,
          contact: profile.contact,
          city: profile.city,
          state: profile.state,
          pincode: profile.pincode,
          skills: profile.skills,
          languages: profile.languages,
          resume: profile.resume, // 🔹 important!
          createdAt: profile.createdAt,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching freelancer profile:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
};


export const POST = async (req: NextRequest) => {

  try {
        const user = await getAuthUser();

    // Parse form data
    const formData = await req.formData();
    console.log("Form data keys:", Array.from(formData.keys()));

    // Extract all fields with debugging
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
        { status: 400 }
      );
    }

    if (!skills.length || !languages.length) {
      return NextResponse.json(
        { success: false, error: "skills and languages cannot be empty" },
        { status: 400 }
      );
    }

    const ratePerHour = Number(ratePerHourString);
    const pincodeNumber = parseInt(pincodeString, 10);

    console.log("=== CONVERTED VALUES ===");
    console.log(
      "ratePerHour (converted):",
      ratePerHour,
      "isNaN:",
      isNaN(ratePerHour)
    );
    console.log(
      "pincodeNumber (converted):",
      pincodeNumber,
      "isNaN:",
      isNaN(pincodeNumber)
    );

    const missingFields: string[] = [];
    if (!resume || resume.size === 0) missingFields.push("resume");
    if (!industry) missingFields.push("industry");
    if (!skills || skills.length === 0) missingFields.push("skills");
    if (!experience) missingFields.push("experience");
    if (!education) missingFields.push("education");
    if (!languages || languages.length === 0) missingFields.push("languages");
    if (!bio) missingFields.push("bio");
    if (!ratePerHourString) missingFields.push("ratePerHour");
    if (!DOB) missingFields.push("DOB");
    if (!city) missingFields.push("city");
    if (!state) missingFields.push("state");
    if (!pincodeString) missingFields.push("pincode");
    if (!contact) missingFields.push("contact");

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Missing required fields: ${missingFields.join(", ")}`,
        },
        { status: 400 }
      );
    }

    if (isNaN(ratePerHour) || ratePerHour <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid rate per hour. Must be a positive number.",
        },
        { status: 400 }
      );
    }

    if (isNaN(pincodeNumber) || pincodeNumber <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid pincode. Must be a positive number.",
        },
        { status: 400 }
      );
    }

    // Validate enum values
    const validIndustries = Object.values(Industry);
    const validExperiences = Object.values(Experience);

    console.log("Valid industries:", validIndustries);
    console.log("Valid experiences:", validExperiences);

    if (!validIndustries.includes(industry as Industry)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid industry. Must be one of: ${validIndustries.join(
            ", "
          )}`,
        },
        { status: 400 }
      );
    }

    if (!validExperiences.includes(experience as Experience)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid experience. Must be one of: ${validExperiences.join(
            ", "
          )}`,
        },
        { status: 400 }
      );
    }

    // Validate date
    const dobDate = new Date(DOB);
    console.log(
      "DOB parsed as Date:",
      dobDate,
      "Is valid:",
      !isNaN(dobDate.getTime())
    );

    if (isNaN(dobDate.getTime())) {
      return NextResponse.json(
        { success: false, error: "Invalid date of birth format." },
        { status: 400 }
      );
    }

    // 🔹 Upload resume to Cloudinary
    try {
      const bytes = await resume.arrayBuffer();
      const buffer = Buffer.from(bytes);

      console.log("Resume buffer size:", buffer.length);

      const uploadResult: any = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: "resumes",
              resource_type: "raw",
              public_id: `resume_${user}_${Date.now()}`,
            },
            (err, result) => {
              if (err) {
                console.error("Cloudinary upload error:", err);
                reject(err);
              } else {
                console.log("Cloudinary upload success:", result?.public_id);
                resolve(result);
              }
            }
          )
          .end(buffer);
      });

      const resumeUrl = uploadResult.secure_url;
      console.log("Resume URL:", resumeUrl);

      // Check for existing profile
      const existingProfile = await prisma.freelancerProfile.findUnique({
        where: { userId: user.id },
      });

      // Prepare payload
      const payload = {
        resume: resumeUrl,
        industry: industry as Industry,
        skills: skills,
        experience: experience as Experience,
        education: education,
        languages: languages,
        bio: bio,
        ratePerHour: ratePerHour,
        DOB: dobDate,
        city: city,
        state: state,
        pincode: pincodeNumber,
        contact: contact,
        userId: user.id, // Use direct userId instead of nested connect
      };

      console.log("Payload prepared:", JSON.stringify(payload, null, 2));

      const profile = existingProfile
        ? await prisma.freelancerProfile.update({
            where: { userId: user.id },
            data: payload,
          })
        : await prisma.freelancerProfile.create({
            data: payload,
          });
      console.log("Profile ID:", profile.id);

      return NextResponse.json(
        {
          success: true,
          profile: {
            id: profile.id,
            industry: profile.industry,
            experience: profile.experience,
            ratePerHour: profile.ratePerHour,
            city: profile.city,
            state: profile.state,
            createdAt: profile.createdAt,
          },
        },
        { status: existingProfile ? 200 : 201 }
      );
    } catch (uploadError: any) {
      console.error(
        "Error during resume upload or database operation:",
        uploadError
      );
      return NextResponse.json(
        {
          success: false,
          error:
            uploadError.message || "Failed to upload resume or save profile",
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Error in freelancer profile API:", error);
    console.error("Error stack:", error.stack);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal server error",
        details:
          process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
};
