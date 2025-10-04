import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST - Mark lesson as complete
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;

    const user = session.user as { role: string; id: string };

    // Check if student is enrolled in the course containing this lesson
    const lesson = await prisma.lesson.findUnique({
      where: { id: resolvedParams.id },
      include: {
        module: {
          include: {
            course: {
              include: {
                enrollments: {
                  where: {
                    studentId: user.id,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    if (lesson.module.course.enrollments.length === 0) {
      return NextResponse.json(
        { error: "You are not enrolled in this course" },
        { status: 403 }
      );
    }

    // Create or update lesson progress
    const existingProgress = await prisma.lessonProgress.findUnique({
      where: {
        studentId_lessonId: {
          studentId: user.id,
          lessonId: resolvedParams.id,
        },
      },
    });

    if (existingProgress) {
      // Update existing progress
      const updatedProgress = await prisma.lessonProgress.update({
        where: {
          id: existingProgress.id,
        },
        data: {
          completed: true,
          completedAt: new Date(),
        },
      });
      return NextResponse.json(updatedProgress);
    } else {
      // Create new progress record
      const newProgress = await prisma.lessonProgress.create({
        data: {
          studentId: user.id,
          lessonId: resolvedParams.id,
          completed: true,
          completedAt: new Date(),
        },
      });
      return NextResponse.json(newProgress);
    }
  } catch (error) {
    console.error("Error marking lesson complete:", error);
    return NextResponse.json(
      { error: "Failed to mark lesson complete" },
      { status: 500 }
    );
  }
}
