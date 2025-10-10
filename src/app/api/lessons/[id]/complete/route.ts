import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface CompleteData {
  timeSpent?: number;
  watchedDuration?: number;
  lastPosition?: number;
}

// POST - Mark lesson as complete
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const data: CompleteData = await request.json().catch(() => ({}));

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

    // Check prerequisites
    if (lesson.prerequisites && lesson.prerequisites.length > 0) {
      const completedPrerequisites = await prisma.lessonProgress.findMany({
        where: {
          studentId: user.id,
          lessonId: { in: lesson.prerequisites },
          completed: true,
        },
      });

      if (completedPrerequisites.length < lesson.prerequisites.length) {
        return NextResponse.json(
          { error: "Prerequisites not completed" },
          { status: 400 }
        );
      }
    }

    // Check if lesson is scheduled and available
    if (lesson.scheduledAt && lesson.scheduledAt > new Date()) {
      return NextResponse.json(
        { error: "Lesson not yet available" },
        { status: 400 }
      );
    }

    // Create or update lesson progress
    const progressData = {
      completed: true,
      completedAt: new Date(),
      timeSpent: data.timeSpent || null,
      watchedDuration: data.watchedDuration || null,
      lastPosition: data.lastPosition || null,
    };

    const updatedProgress = await prisma.lessonProgress.upsert({
      where: {
        studentId_lessonId: {
          studentId: user.id,
          lessonId: resolvedParams.id,
        },
      },
      update: progressData,
      create: {
        ...progressData,
        studentId: user.id,
        lessonId: resolvedParams.id,
      },
    });

    // Update course enrollment progress
    const courseId = lesson.module.courseId;
    const totalLessons = await prisma.lesson.count({
      where: {
        module: { courseId },
      },
    });

    const completedLessons = await prisma.lessonProgress.count({
      where: {
        studentId: user.id,
        completed: true,
        lesson: {
          module: { courseId },
        },
      },
    });

    const progressPercentage = Math.round((completedLessons / totalLessons) * 100);

    await prisma.enrollment.update({
      where: {
        studentId_courseId: {
          studentId: user.id,
          courseId,
        },
      },
      data: {
        progress: progressPercentage,
      },
    });

    return NextResponse.json({
      ...updatedProgress,
      courseProgress: progressPercentage,
    });
  } catch (error) {
    console.error("Error marking lesson complete:", error);
    return NextResponse.json(
      { error: "Failed to mark lesson complete" },
      { status: 500 }
    );
  }
}
