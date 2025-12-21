import { prisma } from "@/app";
import { NextResponse, NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth";

export const GET = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const user = await getAuthUser();

    const {id: jobId} = await params

    if (user.role !== "CLIENT") {
      return NextResponse.json(
        {
          success: false,
          messgae: "Only client can view applications",
        },
        { status: 403 }
      );
    }

    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return NextResponse.json(
        {
          success: false,
          messgae: "Job not found",
        },
        { status: 401 }
      );
    }

    if (job.clientId !== user.id) {
      return NextResponse.json(
        {
          success: false,
          messgae: "You cannot view applications on this job",
        },
        { status: 403 }
      );
    }

    const applications = await prisma.application.findMany({
      where: { jobId },
      orderBy: { appliedAt: "desc" },
      include: {
        freelancer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            freelancerProfile: {
              select: {
                industry: true,
                skills: true,
                experience: true,
                ratePerHour: true,
                city: true,
                state: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        totalApplications: applications.length,
        applications,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching job applications:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
};
