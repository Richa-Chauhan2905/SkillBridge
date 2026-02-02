import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app";
import { getAuthUser } from "@/lib/auth";

export const PATCH = async (
  req: NextRequest,
  { params }: { params: { applicationId?: string } }
) => {
  try {
    const user = await getAuthUser();

    if (user.role !== "CLIENT") {
      return NextResponse.json(
        { success: false, error: "Only clients can update applications" },
        { status: 403 }
      );
    }

    const { applicationId } = await params;

    if (!applicationId) {
      return NextResponse.json(
        { success: false, error: "Application ID missing" },
        { status: 400 }
      );
    }

    const { status } = await req.json();

    if (!["HIRED", "REJECTED"].includes(status)) {
      return NextResponse.json(
        { success: false, error: "Invalid status" },
        { status: 400 }
      );
    }

    const existing = await prisma.application.findUnique({
      where: { id: applicationId },
      select: {
        id: true,
        jobId: true,
        freelancerId: true,
        job: { select: { clientId: true } },
      },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Application not found" },
        { status: 404 }
      );
    }

    if (existing.job.clientId !== user.id) {
      return NextResponse.json(
        { success: false, error: "Not your job" },
        { status: 403 }
      );
    }

    // 🔒 Transaction: hire + close job + reject others
    await prisma.$transaction(async (tx) => {
      await tx.application.update({
        where: { id: applicationId },
        data: { status },
      });

      if (status === "HIRED") {
        await tx.job.update({
          where: { id: existing.jobId },
          data: { status: "FILLED" },
        });

        await tx.application.updateMany({
          where: {
            jobId: existing.jobId,
            NOT: { id: applicationId },
          },
          data: { status: "REJECTED" },
        });

        await tx.notification.create({
          data: {
            userId: existing.freelancerId,
            type: "JOB",
            title: "You’ve been hired 🎉",
            description: "Congratulations! You were hired for a job you applied to.",
          },
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH application status error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
};
