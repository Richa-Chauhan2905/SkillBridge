import {prisma} from "@/app/index"
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { Role } from '@/app/generated/prisma/enums'; // Import the enum

export const POST = async (req: NextRequest) => {
  try {
    const { role, firstName, lastName, email, password } = await req.json();

    // Validate required fields
    if (!role || !firstName || !lastName || !email || !password) {
      return NextResponse.json(
        {
          error: "All fields are required",
        },
        { status: 400 }
      );
    }

    // Validate role is one of the allowed enum values
    if (!Object.values(Role).includes(role)) {
      return NextResponse.json(
        {
          error: "Invalid role. Must be one of: USER, FREELANCER, or CLIENT",
        },
        { status: 400 }
      );
    }

    const existingEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingEmail) {
      return NextResponse.json(
        {
          error: "Email already exists",
        },
        { status: 409 }
      );
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

    if (!passwordRegex.test(password)) {
      return NextResponse.json(
        {
          error:
            "Password must be at least 8 characters long, include an uppercase letter, lowercase letter, number, and special character.",
        },
        {
          status: 400,
        }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        role: role as Role, // Use the enum type
        firstName,
        lastName,
        email,
        password: hashedPassword,
      },
    });

    return NextResponse.json(
      {
        message: "User created successfully",
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error during signup: ", error);
    return NextResponse.json(
      {
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
};