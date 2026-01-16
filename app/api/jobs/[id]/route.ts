import { prisma } from "@/app";
import { NextResponse, NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth";

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const user = await getAuthUser();

    const { id: jobId } = await params;

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!job) {
      return NextResponse.json(
        { success: false, error: "Job not found" },
        { status: 404 }
      );
    }

    if (user.role === "FREELANCER") {
      return NextResponse.json({ success: true, job });
    }

    if (user.role === "CLIENT" && job.clientId !== user.id) {
      return NextResponse.json({ success: true, job });
    }

    if (user.role === "CLIENT" && job.clientId === user.id) {
      const applicationsCount = await prisma.application.count({
        where: { jobId: job.id },
      });

      return NextResponse.json({
        success: true,
        job,
        applicationsCount,
      });
    }

    return NextResponse.json({ success: true, job });
  } catch (error) {
    console.error("Error fetching job:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
};

export const PATCH = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const user = await getAuthUser();

    if (user.role !== "CLIENT") {
      return NextResponse.json(
        { success: false, error: "Only clients can update jobs" },
        { status: 403 }
      );
    }

    const { id: jobId } = await params;

    const job = await prisma.job.findUnique({
      where: { id: jobId },
    });

    if (!job) {
      return NextResponse.json(
        { success: false, error: "Job not found" },
        { status: 404 }
      );
    }

    if (job.clientId !== user.id) {
      return NextResponse.json(
        { success: false, error: "You can update only your own job" },
        { status: 403 }
      );
    }

    const data = await req.json();

    const updatedJob = await prisma.job.update({
      where: { id: jobId },
      data: {
        title: data?.title,
        description: data?.description,
        payPerHour: data?.payPerHour,
        mandatorySkills: data?.mandatorySkills,
        niceToHaveSkills: data?.niceToHaveSkills,
        tools: data?.tools,
        preferredLocation: data?.preferredLocation,
        preferredEducation: data?.preferredEducation,
        clientLocation: data?.clientLocation,
        status: data?.status,
      },
    });

    return NextResponse.json({ success: true, updatedJob });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
};
