import { prisma } from "@/app/index";
import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";

export const GET = async () => {
  try {
    const user = await getAuthUser();

    if (user.role !== "FREELANCER") {
      return NextResponse.json(
        { success: false, message: "Only freelancers can view applications" },
        { status: 403 }
      );
    }

    const applications = await prisma.application.findMany({
      where: {
        freelancerId: user.id,
      },
      include: {
        job: {
          include: {
            client: {
              select: {
                firstName: true,
                lastName: true,
                clientProfile: {
                  select: {
                    companyName: true,
                    industry: true,
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
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
};
