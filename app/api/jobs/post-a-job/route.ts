import { prisma } from "@/app";
import { NextResponse, NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth";

export const POST = async (req: NextRequest) => {
  try {
    const user = await getAuthUser();

    const client = await prisma.user.findUnique({
      where: {
        id: user.id,
      },
      select: {
        role: true,
      },
    });

    if (client?.role !== "CLIENT") {
      return NextResponse.json(
        {
          success: false,
          error: "Forbidden: Only recruiters can post jobs",
        },
        {
          status: 403,
        }
      );
    }

    const {
      title,
      description,
      postedAt,
      requiredExperience,
      payPerHour,
      mandatorySkills,
      niceToHaveSkills,
      tools,
      preferredLocation,
      preferredEducation,
      clientLocation,
      status,
      reviews,
      payments,
      savedJobs,
    } = await req.json();

    if (
      !title.trim() ||
      !description.trim() ||
      !postedAt ||
      !requiredExperience ||
      !preferredLocation ||
      !payPerHour ||
      !preferredEducation ||
      !tools ||
      !clientLocation ||
      !status
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
        },
        {
          status: 400,
        }
      );
    }

    const newJob = await prisma.job.create({
      data: {
        title,
        description,
        postedAt,
        requiredExperience,
        payPerHour,
        mandatorySkills,
        niceToHaveSkills,
        tools,
        preferredLocation,
        preferredEducation,
        clientLocation,
        status,
        reviews,
        payments,
        savedJobs,
        client: {
          connect: { id: user.id },
        },
      },
    });

    return new NextResponse(
      JSON.stringify({
        success: true,
        newJob,
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error creating job:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
