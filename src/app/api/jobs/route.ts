import { db } from "@/src/db";
import {
  jobs,
  users,
  clientProfiles,
  freelancerProfiles,
} from "@/src/db/schema";
import { eq, desc, count, sql } from "drizzle-orm";
import { NextResponse, NextRequest } from "next/server";
import { getAuthUser } from "@/src/lib/auth";

const ITEMS_PER_PAGE = 10;

export const GET = async (req: NextRequest) => {
  try {
    const user = await getAuthUser();

    if (user.role !== "FREELANCER") {
      return NextResponse.json(
        { success: false, error: "Only freelancers can view jobs" },
        { status: 403 },
      );
    }

    const page = parseInt(req.nextUrl.searchParams.get("page") || "1", 10);

    // Get freelancer's industry
    const freelancer = await db
      .select()
      .from(freelancerProfiles)
      .where(eq(freelancerProfiles.userId, user.id));

    if (freelancer.length === 0) {
      return NextResponse.json(
        { success: false, error: "Freelancer profile not found" },
        { status: 404 },
      );
    }

    const industry = freelancer[0].industry;
    if (!industry) {
      return NextResponse.json(
        { success: false, error: "Industry not set" },
        { status: 400 },
      );
    }

    // Count total jobs
    const totalResult = await db
      .select({ count: count() })
      .from(jobs)
      .innerJoin(users, eq(jobs.clientId, users.id))
      .innerJoin(clientProfiles, eq(clientProfiles.userId, users.id))
      .where(eq(clientProfiles.industry, industry));

    const totalJobs = totalResult[0].count;

    // Fetch flat data (all columns needed)
    const flatJobs = await db
      .select({
        id: jobs.id,
        title: jobs.title,
        description: jobs.description,
        payPerHour: jobs.payPerHour,
        mandatorySkills: jobs.mandatorySkills,
        niceToHaveSkills: jobs.niceToHaveSkills,
        tools: jobs.tools,
        requiredExperience: jobs.requiredExperience,
        status: jobs.status,
        preferredLocation: jobs.preferredLocation,
        preferredEducation: jobs.preferredEducation,
        clientLocation: jobs.clientLocation,
        createdAt: jobs.createdAt,
        clientId: users.id,
        clientFirstName: users.firstName,
        clientLastName: users.lastName,
        clientIndustry: clientProfiles.industry,
        companyName: clientProfiles.companyName,
        companyWebsite: clientProfiles.companyWebsite,
        linkedInProfile: clientProfiles.linkedInProfile,
      })
      .from(jobs)
      .innerJoin(users, eq(jobs.clientId, users.id))
      .innerJoin(clientProfiles, eq(clientProfiles.userId, users.id))
      .where(eq(clientProfiles.industry, industry))
      .orderBy(desc(jobs.createdAt))
      .limit(ITEMS_PER_PAGE)
      .offset((page - 1) * ITEMS_PER_PAGE);

    // Transform flat data into nested structure expected by frontend
    const jobsData = flatJobs.map((job) => ({
      id: job.id,
      title: job.title,
      description: job.description,
      payPerHour: job.payPerHour,
      mandatorySkills: job.mandatorySkills ?? [],
      niceToHaveSkills: job.niceToHaveSkills ?? [],
      tools: job.tools ?? [],
      requiredExperience: job.requiredExperience,
      status: job.status,
      preferredLocation: job.preferredLocation,
      preferredEducation: job.preferredEducation,
      clientLocation: job.clientLocation,
      createdAt: job.createdAt,
      client: {
        id: job.clientId,
        firstName: job.clientFirstName,
        lastName: job.clientLastName,
        clientProfile: {
          industry: job.clientIndustry,
          companyName: job.companyName,
          companyWebsite: job.companyWebsite,
          linkedInProfile: job.linkedInProfile,
        },
      },
    }));

    return NextResponse.json(
      {
        success: true,
        jobs: jobsData,
        pagination: {
          totalJobs,
          totalPages: Math.ceil(totalJobs / ITEMS_PER_PAGE),
          currentPage: page,
          hasNextPage: page < Math.ceil(totalJobs / ITEMS_PER_PAGE),
          hasPrevPage: page > 1,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error getting jobs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
};

export const POST = async (req: NextRequest) => {
  try {
    const user = await getAuthUser();

    /* ===== Check role ===== */

    const dbUser = await db.select().from(users).where(eq(users.id, user.id));

    if (dbUser[0]?.role !== "CLIENT") {
      return NextResponse.json(
        {
          success: false,
          error: "Only recruiters can post jobs",
        },
        { status: 403 },
      );
    }

    const data = await req.json();

    const {
      title,
      description,
      requiredExperience,
      payPerHour,
      mandatorySkills,
      niceToHaveSkills,
      tools,
      preferredLocation,
      preferredEducation,
      clientLocation,
      status,
    } = data;

    /* ===== Validation ===== */

    if (
      !title ||
      !description ||
      !requiredExperience ||
      !payPerHour ||
      !tools ||
      !status
    ) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 },
      );
    }

    /* ===== Insert ===== */

    const newJob = await db
      .insert(jobs)
      .values({
        title,
        description,
        requiredExperience:
          requiredExperience as (typeof jobs.$inferInsert)["requiredExperience"],
        payPerHour: Number(payPerHour),

        mandatorySkills: mandatorySkills ?? [],
        niceToHaveSkills: niceToHaveSkills ?? [],
        tools: tools ?? [],

        preferredLocation: preferredLocation ?? null,
        preferredEducation: preferredEducation ?? null,
        clientLocation: clientLocation ?? null,

        status: status as (typeof jobs.$inferInsert)["status"],

        clientId: user.id,
      })
      .returning();

    return NextResponse.json(
      {
        success: true,
        newJob: newJob[0],
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating job:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    );
  }
};
