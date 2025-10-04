import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId, courseId } = await request.json();

    if (!sessionId || !courseId) {
      return NextResponse.json(
        { error: "Session ID and Course ID are required" },
        { status: 400 }
      );
    }

    // For development mode, skip payment record checks and proceed directly to enrollment
    console.log("Development mode: Skipping payment record verification");

    // Get course details for enrollment
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Create enrollment for the user
    const existingEnrollment = await prisma.enrollment.findFirst({
      where: {
        studentId: session.user.id,
        courseId: courseId,
      },
    });

    if (!existingEnrollment) {
      await prisma.enrollment.create({
        data: {
          studentId: session.user.id,
          courseId: courseId,
          progress: 0,
        },
      });
    }

    // For development, skip transaction record creation for now
    console.log("Development mode: Skipping transaction record creation");

    return NextResponse.json({
      success: true,
      message: "Payment completed successfully",
    });
  } catch (error) {
    console.error("Error completing development payment:", error);
    return NextResponse.json(
      { error: "Failed to complete payment" },
      { status: 500 }
    );
  }
}
