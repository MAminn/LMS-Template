import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Get student's certificates
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as { role: string; id: string; name: string };

    // Get all enrollments for the student
    const enrollments = await prisma.enrollment.findMany({
      where: {
        studentId: user.id,
      },
      include: {
        course: {
          include: {
            instructor: {
              select: {
                name: true,
              },
            },
            modules: {
              include: {
                lessons: true,
              },
            },
          },
        },
      },
    });

    const certificates = [];

    for (const enrollment of enrollments) {
      const course = enrollment.course;

      // Get all lessons in the course
      const allLessons = course.modules.flatMap((module) => module.lessons);

      if (allLessons.length === 0) continue;

      // Get completed lessons for this student
      const completedProgress = await prisma.lessonProgress.findMany({
        where: {
          studentId: user.id,
          lessonId: {
            in: allLessons.map((lesson) => lesson.id),
          },
          completed: true,
        },
      });

      // Check if course is 100% complete
      if (completedProgress.length === allLessons.length) {
        // Find the latest completion date
        const latestCompletion = completedProgress.reduce(
          (latest, progress) => {
            const progressDate = new Date(
              progress.completedAt || progress.createdAt
            );
            const latestDate = new Date(latest.completedAt || latest.createdAt);
            return progressDate > latestDate ? progress : latest;
          }
        );

        certificates.push({
          courseId: course.id,
          courseTitle: course.title,
          studentName: user.name || "Student",
          instructorName: course.instructor.name || "Instructor",
          completionDate: new Date(
            latestCompletion.completedAt || latestCompletion.createdAt
          ).toLocaleDateString(),
          totalLessons: allLessons.length,
          completedLessons: completedProgress.length,
        });
      }
    }

    return NextResponse.json(certificates);
  } catch (error) {
    console.error("Error fetching certificates:", error);
    return NextResponse.json(
      { error: "Failed to fetch certificates" },
      { status: 500 }
    );
  }
}
