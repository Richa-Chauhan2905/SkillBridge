import { prisma } from "@/app";
import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";

export const POST = async (req: Request) => {
  try {
    const user = await getAuthUser();

    if (user.role !== "FREELANCER") {
      return NextResponse.json(
        { success: false, message: "Only freelancers can save jobs" },
        { status: 401 }
      );
    }

    const { jobId } = await req.json();

    if (!jobId) {
      return NextResponse.json(
        { success: false, message: "Job ID is required" },
        { status: 400 }
      );
    }

    await prisma.savedJob.create({
      data: {
        userId: user.id,
        jobId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Job saved successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
};

export const GET = async () => {
  try {
    const user = await getAuthUser();

    if (user.role !== "FREELANCER") {
      return NextResponse.json(
        { success: false, message: "Only freelancers can view saved jobs" },
        { status: 401 }
      );
    }

    const savedJobs = await prisma.savedJob.findMany({
      where: {
        userId: user.id,
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            description: true,
            payPerHour: true,
            mandatorySkills: true,
            niceToHaveSkills: true,
            tools: true,
            status: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        savedAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      savedJobs: savedJobs.map((s) => s.job),
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
};

export const DELETE = async (req: Request) => {
  try {
    const user = await getAuthUser();

    if (user.role !== "FREELANCER") {
      return NextResponse.json(
        { success: false, message: "Only freelancers can unsave jobs" },
        { status: 401 }
      );
    }

    const { jobId } = await req.json();

    const savedJob = await prisma.savedJob.findFirst({
      where: {
        userId: user.id,
        jobId,
      },
    });

    if (!savedJob) {
      return NextResponse.json(
        { success: false, message: "Saved job not found" },
        { status: 404 }
      );
    }

    await prisma.savedJob.delete({
      where: { id: savedJob.id },
    });

    return NextResponse.json({
      success: true,
      message: "Job removed from saved list",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
};
