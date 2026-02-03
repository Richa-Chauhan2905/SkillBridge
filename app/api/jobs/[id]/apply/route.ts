import { prisma } from "@/app/index";
import { NextResponse, NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth";

export const POST = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const user = await getAuthUser();

    if (user.role !== "FREELANCER") {
      return NextResponse.json(
        {
          success: false,
          messgae: "Only freelancers can apply",
        },
        { status: 403 }
      );
    }
    const {id: jobId} = await params;

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

    if (job.status !== "OPEN") {
      return NextResponse.json(
        {
          success: false,
          messgae: "Cannot apply to closed jobs",
        },
        { status: 404 }
      );
    }

    const existingApplication = await prisma.application.findUnique({
      where: {
        jobId_freelancerId: {
          jobId,
          freelancerId: user.id,
        },
      },
    });

    if (existingApplication) {
      return NextResponse.json(
        { success: false, message: "Already applied to this job" },
        { status: 409 }
      );
    }

    const application = await prisma.application.create({
      data: {
        jobId,
        freelancerId: user.id,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Applied successfully",
        application,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    );
  }
};
