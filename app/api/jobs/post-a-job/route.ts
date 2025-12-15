import { prisma } from "@/app";
import { NextResponse, NextRequest } from "next/server";
import { getServerSession, User } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/options";

export const POST = async (req: NextRequest) => {
  const session = await getServerSession(authOptions);
  const user: User = session?.user;

  if (!session || !session.user || !user.email) {
    return NextResponse.json(
      {
        success: false,
        error: "Unauthorized",
      },
      {
        status: 401,
      }
    );
  }

  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!dbUser) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        {
          status: 404,
        }
      );
    }

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
