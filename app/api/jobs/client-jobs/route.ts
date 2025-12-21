import { NextResponse, NextRequest } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/app";

const ITEMS_PER_PAGE = 10;

export const GET = async (req: NextRequest) => {
  try {
    const user = await getAuthUser();

    if (user.role !== "CLIENT") {
      return NextResponse.json(
        { success: false, error: "Only client can view their personal jobs" },
        { status: 403 }
      );
    }
    const page = parseInt(req.nextUrl.searchParams.get("page") || "1", 10);

    const totalJobs = await prisma.job.count({
      where: {
        clientId: user.id,
      },
    });

    const clientJobs = await prisma.job.findMany({
      where: { clientId: user.id },
      skip: (page - 1) * ITEMS_PER_PAGE,
      take: ITEMS_PER_PAGE,
      orderBy: { createdAt: "desc" },
      include: {
        client: {
          select: { id: true, firstName: true, lastName: true },
        },
        _count: {
          select: { applications: true },
        },
      },
    });

    const jobsWithApplicationsCount = clientJobs.map((job) => ({
      ...job,
      applicationsCount: job._count.applications,
    }));

    const responseData = JSON.stringify({
      success: true,
      clientJobs: jobsWithApplicationsCount,
      pagination: {
        totalJobs,
        totalPages: Math.ceil(totalJobs / ITEMS_PER_PAGE),
        currentPage: page,
        hasNextPage: page < Math.ceil(totalJobs / ITEMS_PER_PAGE),
        hasPrevPage: page > 1,
      },
    });

    return new NextResponse(responseData, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error getting jobs:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
      },
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
