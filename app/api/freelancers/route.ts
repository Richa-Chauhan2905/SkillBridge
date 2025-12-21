import { prisma } from "@/app";
import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";

export const GET = async () => {
  try {
    const user = await getAuthUser();

    if (user.role !== "CLIENT") {
      return NextResponse.json(
        {
          success: false,
          message: "Only client can view freelancer profiles",
        },
        { status: 401 }
      );
    }

    const client = await prisma.clientProfile.findUnique({
      where: { userId: user.id },
      select: { industry: true },
    });

    if (!client) {
      return NextResponse.json(
        {
          success: false,
          message: "Client profile not found",
        },
        { status: 404 }
      );
    }

    const freelancers = await prisma.freelancerProfile.findMany({
      where: {
        industry: client.industry,
      },
      select: {
        userId: true,
        ratePerHour: true,
        city: true,
        state: true,
        experience: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      freelancers,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
};
