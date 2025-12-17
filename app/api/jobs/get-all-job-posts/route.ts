import { prisma } from "@/app";
import { getAuthUser } from "@/lib/auth";
import { NextResponse, NextRequest } from "next/server";

const ITEMS_PER_PAGE = 10;

export const GET = async (req: NextRequest) => {
  try {
    const user = await getAuthUser();

    if (user.role !== "FREELANCER") {
      return NextResponse.json(
        { success: false, error: "Only freelancers can view jobs" },
        { status: 403 }
      );
    }

    const page = parseInt(req.nextUrl.searchParams.get("page") || "1", 10);

    const freelancerProfile = await prisma.freelancerProfile.findUnique({
      where: { userId: user.id },
      select: { industry: true },
    });

    if (!freelancerProfile) {
      return NextResponse.json(
        { success: false, error: "Freelancer profile not found" },
        { status: 404 }
      );
    }

    const industry = freelancerProfile.industry;

    const totalJobs = await prisma.job.count({
      where: {
        client: {
          clientProfile: {
            industry: industry,
          },
        },
      },
    });

    const jobs = await prisma.job.findMany({
      where: {
        client: {
          clientProfile: {
            industry: industry,
          },
        },
      },
      skip: (page - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
            clientProfile: {
              select: {
                industry: true,
                companyName: true,
                companyWebsite: true,
                linkedInProfile: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        jobs,
        pagination: {
          totalJobs,
          totalPages: Math.ceil(totalJobs / ITEMS_PER_PAGE),
          currentPage: page,
          hasNextPage: page < Math.ceil(totalJobs / ITEMS_PER_PAGE),
          hasPrevPage: page > 1,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error getting jobs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
};
