import { prisma } from "@/app/index";
import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";

export const GET = async () => {
  try {
    const user = await getAuthUser();

    if (user.role !== "FREELANCER") {
      return NextResponse.json(
        { success: false, message: "Only freelancers can view their applications" },
        { status: 401 }
      );
    }

    const applications = await prisma.application.findMany({
      where: {
        freelancerId: user.id,
      },
      select: {
        id: true,
        jobId: true,
        status: true,
        appliedAt: true,
        job: {
          select: {
            title: true,
            description: true,
            requiredExperience: true,
            payPerHour: true,
            status: true,
            client: {
              select: {
                firstName: true,
                lastName: true,
                clientProfile: {
                  select: {
                    companyName: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        appliedAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      applications,
    });
  } catch (error) {
    console.error("Error fetching applications:", error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
};