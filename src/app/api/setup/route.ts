import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    console.log("Setup endpoint called");

    // Check if admin user already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: "ADMIN" },
    });

    if (existingAdmin) {
      console.log("Admin user already exists:", existingAdmin.email);
      return NextResponse.json({
        success: true,
        message: "Database already initialized",
        admin: existingAdmin.email,
        timestamp: new Date().toISOString(),
      });
    }

    console.log("Creating new users...");

    // Hash passwords
    const adminPassword = await bcrypt.hash("admin123", 12);
    const instructorPassword = await bcrypt.hash("instructor123", 12);
    const studentPassword = await bcrypt.hash("student123", 12);

    console.log("Passwords hashed, creating users...");

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email: "admin@academy.com",
        name: "Admin User",
        password: adminPassword,
        role: "ADMIN",
      },
    });
    console.log("Admin created:", admin.email);

    // Create instructor user
    const instructor = await prisma.user.create({
      data: {
        email: "instructor@academy.com",
        name: "Instructor User",
        password: instructorPassword,
        role: "INSTRUCTOR",
      },
    });
    console.log("Instructor created:", instructor.email);

    // Create student user
    const student = await prisma.user.create({
      data: {
        email: "student@academy.com",
        name: "Student User",
        password: studentPassword,
        role: "STUDENT",
      },
    });
    console.log("Student created:", student.email);

    return NextResponse.json({
      success: true,
      message: "Database initialized successfully with test users",
      users: {
        admin: admin.email,
        instructor: instructor.email,
        student: student.email,
      },
      credentials: {
        admin: { email: "admin@academy.com", password: "admin123" },
        instructor: {
          email: "instructor@academy.com",
          password: "instructor123",
        },
        student: { email: "student@academy.com", password: "student123" },
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Setup error details:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to initialize database",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
