import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/index";
import { getAuthUser } from "@/lib/auth";
import { JobStatus } from "@/app/generated/prisma/enums";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser();

    // Only CLIENT can update job status
    if (user.role !== "CLIENT") {
      return NextResponse.json(
        { success: false, error: "Only clients can update job status" },
        { status: 403 }
      );
    }

    const { id: jobId } = await params;
    const { status } = await req.json();

    // Validate status
    if (!Object.values(JobStatus).includes(status)) {
      return NextResponse.json(
        { success: false, error: "Invalid job status" },
        { status: 400 }
      );
    }

    // Check job exists + belongs to client
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: {
        id: true,
        clientId: true,
        status: true,
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

    // Update job status
    const updatedJob = await prisma.job.update({
      where: { id: jobId },
      data: { status },
      select: {
        id: true,
        status: true,
      },
    });

    return NextResponse.json(
      { success: true, job: updatedJob },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating job status:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
