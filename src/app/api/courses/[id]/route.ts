import { NextRequest, NextResponse } from "next/server";
import { getServices } from "@/infrastructure/services/ServiceFactory";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

const { courseService } = getServices();

/**
 * GET /api/courses/[id]
 * Get a specific course by ID
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { prisma } = await import("@/lib/prisma");

    const course = await prisma.course.findUnique({
      where: {
        id: resolvedParams.id,
        isPublished: true, // Only allow access to published courses
      },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Transform the data to match frontend expectations
    const courseData = {
      ...course,
      enrollmentCount: course._count.enrollments,
      price: course.price || 0,
    };

    return NextResponse.json(courseData);
  } catch (error) {
    console.error("Error fetching course:", error);
    return NextResponse.json(
      { error: "Failed to fetch course" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/courses/[id]
 * Update a course
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const resolvedParams = await params;

    const updateData = {
      title: body.title,
      description: body.description,
      thumbnail: body.thumbnail,
      price: body.price,
      category: body.category,
      level: body.level,
      language: body.language,
      tags: body.tags,
      requirements: body.requirements,
      learningObjectives: body.learningObjectives,
    };

    const course = await courseService.updateCourse(
      resolvedParams.id,
      updateData,
      session.user.id
    );

    return NextResponse.json({
      success: true,
      data: course,
    });
  } catch (error) {
    console.error("Error updating course:", error);

    if (error instanceof Error && error.message.includes("not found")) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      );
    }

    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized to update this course" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to update course" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/courses/[id]
 * Delete a course
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const resolvedParams = await params;
    await courseService.deleteCourse(resolvedParams.id, session.user.id);

    return NextResponse.json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting course:", error);

    if (error instanceof Error && error.message.includes("not found")) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      );
    }

    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized to delete this course" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to delete course" },
      { status: 500 }
    );
  }
}
