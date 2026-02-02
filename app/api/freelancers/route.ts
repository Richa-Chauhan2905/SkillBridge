import { prisma } from "@/app";
import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";

export const GET = async () => {
  try {
    const user = await getAuthUser();

    if (user.role !== "CLIENT") {
      return NextResponse.json(
        {
          success: false,
          message: "Only client can view freelancer profiles",
        },
        { status: 401 },
      );
    }

    const client = await prisma.clientProfile.findUnique({
      where: { userId: user.id },
      select: { industry: true },
    });

    if (!client) {
      return NextResponse.json(
        {
          success: false,
          message: "Client profile not found",
        },
        { status: 404 },
      );
    }

    const freelancers = await prisma.freelancerProfile.findMany({
      where: {
        industry: client.industry,
      },
      select: {
        id: true,
        userId: true,
        ratePerHour: true,
        city: true,
        state: true,
        DOB: true,
        experience: true,
        industry: true,
        bio: true,
        education: true,
        skills: true,
        languages: true,
        resume: true,
        pincode: true,
        contact: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    const transformedFreelancers = freelancers.map((f) => ({
      id: f.id,
      firstName: f.user.firstName,
      lastName: f.user.lastName,
      email: f.user.email,
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
      transformedFreelancers,
    });
  } catch (error: any) {
    console.log(error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 },
    );
  }
};
