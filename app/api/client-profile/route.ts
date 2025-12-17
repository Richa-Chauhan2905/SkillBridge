import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/app";
import { getAuthUser } from "@/lib/auth";

export const GET = async () => {

  try {
    const user = await getAuthUser();

    const profile = await prisma.clientProfile.findUnique({
      where: {
        userId: user.id,
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!profile) {
      return NextResponse.json(
        {
          success: false,
          error: "Profile not found",
        },
        {
          status: 404,
        }
      );
    }

    const responseData = JSON.stringify({
      success: true,
      profile,
    });

    return NextResponse.json(
      {
        success: true,
        responseData,
      },
      {
        status: 401,
      }
    );
  } catch (error) {
    console.error("Error fetching recruiter profile:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

export const POST = async (req: NextRequest) => {
  try {
    const user = await getAuthUser();

    const { industry, companyName, companyWebsite, linkedInProfile } =
      await req.json();

    if (!industry) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: industry",
        },
        {
          status: 400,
        }
      );
    }

    const existingProfile = await prisma.clientProfile.findUnique({
      where: {
        userId: user.id,
      },
    });

    const payload = {
      industry,
      companyName,
      companyWebsite,
      linkedInProfile,
      userId: user.id,
    };

    const profile = existingProfile
      ? await prisma.clientProfile.update({
          where: {
            userId: user.id,
          },
          data: payload,
        })
      : await prisma.clientProfile.create({
          data: payload,
        });

    return new NextResponse(
      JSON.stringify({
        success: true,
        profile,
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error creating/updating recruiter profile:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
