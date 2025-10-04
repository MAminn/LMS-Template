import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getServices } from "@/infrastructure/services/ServiceFactory";
import { prisma } from "@/lib/prisma";

// GET /api/courses - Get all courses
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    const url = new URL(request.url);
    const query = url.searchParams.get("search") || undefined;
    const instructorId = url.searchParams.get("instructorId") || undefined;
    const published = url.searchParams.get("published");

    const pagination = {
      page: parseInt(url.searchParams.get("page") || "1"),
      limit: parseInt(url.searchParams.get("limit") || "20"),
    };

    // If instructorId is provided, get instructor's courses
    if (instructorId) {
      // Instructor-specific courses require authentication
      if (!session?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      // Use direct Prisma query for instructor courses
      const whereClause = {
        instructorId: instructorId,
        ...(published === "true" && { isPublished: true }),
        ...(published === "false" && { isPublished: false }),
        ...(query && {
          OR: [
            { title: { contains: query } },
            { description: { contains: query } },
          ],
        }),
      };

      const coursesData = await prisma.course.findMany({
        where: whereClause,
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
        orderBy: {
          createdAt: "desc",
        },
        take: pagination.limit,
        skip: (pagination.page - 1) * pagination.limit,
      });

      // Transform the data to match frontend expectations
      const courses = coursesData.map((course) => ({
        ...course,
        enrollmentCount: course._count.enrollments,
        price: course.price || 0,
      }));

      return NextResponse.json({
        courses: courses,
        total: courses.length,
      });
    }

    // For public course listing, get published courses directly from database
    const coursesData = await prisma.course.findMany({
      where: {
        isPublished: true,
        ...(query && {
          OR: [
            { title: { contains: query } },
            { description: { contains: query } },
          ],
        }),
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
      orderBy: {
        createdAt: "desc",
      },
      take: pagination.limit,
      skip: (pagination.page - 1) * pagination.limit,
    });

    // Transform the data to match frontend expectations
    const courses = coursesData.map((course) => ({
      ...course,
      enrollmentCount: course._count.enrollments,
      price: course.price || 0,
    }));

    return NextResponse.json(courses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}

// POST /api/courses - Create a new course
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is instructor or admin
    if (session.user.role !== "INSTRUCTOR" && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Only instructors and admins can create courses" },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate required fields
    if (!body.title || !body.description) {
      return NextResponse.json(
        { error: "Title and description are required" },
        { status: 400 }
      );
    }

    const courseData = {
      title: body.title,
      description: body.description,
      category: body.category || "GENERAL",
      level: body.level || "BEGINNER",
      price: body.price || 0,
      duration: body.duration || 0,
      imageUrl: body.thumbnail || body.imageUrl || null, // Handle both thumbnail and imageUrl
      instructorId: session.user.id,
      status: body.isPublished ? "PUBLISHED" : "DRAFT", // Handle both isPublished and status
    };

    const { courseService } = getServices();
    const course = await courseService.createCourse(
      courseData,
      session.user.id
    );

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    console.error("Error creating course:", error);

    // Return validation errors with more detail
    if (
      error instanceof Error &&
      error.message === "Course validation failed"
    ) {
      const validationError = error as Error & {
        details?: { errors?: string[] };
      };
      console.error("Validation errors:", validationError.details?.errors);
      return NextResponse.json(
        {
          error: "Course validation failed",
          details: validationError.details,
          validationErrors: validationError.details?.errors || [],
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create course" },
      { status: 500 }
    );
  }
}
