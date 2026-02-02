import { prisma } from "@/app";
import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";

export async function GET(
  request: NextRequest, // Add request parameter (can be unused if not needed)
  context: { params: { id: string } }, // params is now the second parameter
) {
  try {
    const user = await getAuthUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 },
      );  
    }
    if (user.role !== "CLIENT") {
      return NextResponse.json(
        {
          success: false,
          message: "Only clients can view freelancer profiles",
        },
        { status: 403 },
      );
    }

    const { id: freelancerId } = context.params;

    const freelancer = await prisma.freelancerProfile.findFirst({
      where: {
        userId: freelancerId,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!freelancer) {
      return NextResponse.json(
        { success: false, message: "Freelancer not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, freelancer }, { status: 200 });
  } catch (error) {
    console.error("Error fetching freelancer:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
