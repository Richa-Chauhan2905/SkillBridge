import { prisma } from "@/app";
import { NextResponse, NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth";

export const GET = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const user = await getAuthUser();
    const jobId = params.id;

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
      return NextResponse.json({ success: true, job }, { status: 200 });
    }

    if (user.role === "CLIENT" && job.clientId !== user.id) {
      return NextResponse.json({ success: true, job }, { status: 200 });
    }

    if (user.role === "CLIENT" && job.clientId === user.id) {
      const applicationsCount = await prisma.application.count({
        where: { jobId: job.id },
      });
      return NextResponse.json(
        { success: true, job, applicationsCount },
        { status: 200 }
      );
    }

    return NextResponse.json({ success: true, job }, { status: 200 });
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
  { params }: { params: { jobId: string } }
) => {
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

    const { jobId } = params;

    const job = await prisma.job.findUnique({
      where: {
        id: jobId,
      },
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

    return NextResponse.json({ success: true, updatedJob }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
};
