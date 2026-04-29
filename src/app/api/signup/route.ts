import { db } from "@/src/db";
import { users, clientProfiles, freelancerProfiles } from "@/src/db/schema";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

export const POST = async (req: NextRequest) => {
  try {
    const { role, firstName, lastName, email, password } = await req.json();

    // Validate required fields
    if (!role || !firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 },
      );
    }

    const validRoles = ["USER", "FREELANCER", "CLIENT"];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // check email exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 409 },
      );
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

    if (!passwordRegex.test(password)) {
      return NextResponse.json(
        {
          error:
            "Password must be strong (8+ chars, upper, lower, number, symbol)",
        },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // 1️⃣ Create user
    const newUser = await db
      .insert(users)
      .values({
        role,
        firstName,
        lastName,
        email,
        password: hashedPassword,
      })
      .returning();

    const user = newUser[0];

    // 2️⃣ CREATE PROFILE AUTOMATICALLY (IMPORTANT FIX)
    if (role === "CLIENT") {
      await db.insert(clientProfiles).values({
        userId: user.id,
        industry: null, // user will fill later
        companyName: null,
        companyWebsite: null,
        linkedInProfile: null,
      });
    }

    if (role === "FREELANCER") {
      await db.insert(freelancerProfiles).values({
        userId: user.id,
        industry: null,
        resume: null,
        skills: [],
        experience: null,
        education: null,
        languages: [],
        bio: null,
        ratePerHour: null,
        DOB: null,
        city: null,
        state: null,
        pincode: null,
        contact: null,
      });
    }

    return NextResponse.json(
      {
        message: "User + profile created successfully",
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error during signup: ", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
};
