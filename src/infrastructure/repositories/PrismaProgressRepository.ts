import { prisma } from "@/lib/prisma";
import type {
  Progress,
  CreateProgressData,
  UpdateProgressData,
  LessonProgress,
  CourseProgress,
  UserProgress,
  CreateLessonProgressData,
  UpdateLessonProgressData,
} from "@/domains/progress/types";
import type { ProgressRepository } from "@/domains/progress/repository";
import type { PaginationParams } from "@/shared/types/global";

/**
 * Prisma implementation of ProgressRepository
 */
export class PrismaProgressRepository implements ProgressRepository {
  /**
   * Find progress by ID
   */
  async findById(id: string): Promise<Progress | null> {
    const enrollment = await prisma.enrollment.findUnique({
      where: { id },
    });

    if (!enrollment) return null;

    const progressData: Progress = {
      id: enrollment.id,
      userId: enrollment.studentId,
      courseId: enrollment.courseId,
      status: this.mapProgressToStatus(enrollment.progress),
      completionPercentage: enrollment.progress,
      startedAt: enrollment.createdAt,
      ...(enrollment.progress >= 100 && { completedAt: enrollment.createdAt }),
      lastAccessedAt: enrollment.createdAt,
      createdAt: enrollment.createdAt,
      updatedAt: enrollment.createdAt,
    };

    return progressData;
  }

  /**
   * Find progress by course and user
   */
  async findByCourseAndUser(
    courseId: string,
    userId: string
  ): Promise<Progress | null> {
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: userId,
          courseId: courseId,
        },
      },
    });

    if (!enrollment) return null;

    const progressData: Progress = {
      id: enrollment.id,
      userId: enrollment.studentId,
      courseId: enrollment.courseId,
      status: this.mapProgressToStatus(enrollment.progress),
      completionPercentage: enrollment.progress,
      startedAt: enrollment.createdAt,
      ...(enrollment.progress >= 100 && { completedAt: enrollment.createdAt }),
      lastAccessedAt: enrollment.createdAt,
      createdAt: enrollment.createdAt,
      updatedAt: enrollment.createdAt,
    };

    return progressData;
  }

  /**
   * Find progress by user
   */
  async findByUser(
    userId: string,
    pagination?: PaginationParams
  ): Promise<readonly Progress[]> {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = pagination || {};
    const skip = (page - 1) * limit;

    const enrollments = await prisma.enrollment.findMany({
      where: { studentId: userId },
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
    });

    return enrollments.map((enrollment) => ({
      id: enrollment.id,
      userId: enrollment.studentId,
      courseId: enrollment.courseId,
      status: this.mapProgressToStatus(enrollment.progress),
      completionPercentage: enrollment.progress,
      startedAt: enrollment.createdAt,
      completedAt:
        enrollment.progress >= 100 ? enrollment.createdAt : undefined,
      lastAccessedAt: enrollment.createdAt,
      createdAt: enrollment.createdAt,
      updatedAt: enrollment.createdAt,
    }));
  }

  /**
   * Create new progress record
   */
  async create(data: CreateProgressData): Promise<Progress> {
    const enrollment = await prisma.enrollment.create({
      data: {
        studentId: data.userId,
        courseId: data.courseId,
        progress: data.completionPercentage,
      },
    });

    return {
      id: enrollment.id,
      userId: enrollment.studentId,
      courseId: enrollment.courseId,
      status: data.status,
      completionPercentage: enrollment.progress,
      startedAt: data.startedAt,
      completedAt: data.completionPercentage >= 100 ? new Date() : undefined,
      lastAccessedAt: new Date(),
      createdAt: enrollment.createdAt,
      updatedAt: enrollment.createdAt,
    };
  }

  /**
   * Update existing progress
   */
  async update(id: string, data: UpdateProgressData): Promise<Progress> {
    const enrollment = await prisma.enrollment.update({
      where: { id },
      data: {
        ...(data.completionPercentage !== undefined && {
          progress: data.completionPercentage,
        }),
      },
    });

    return {
      id: enrollment.id,
      userId: enrollment.studentId,
      courseId: enrollment.courseId,
      status: data.status || this.mapProgressToStatus(enrollment.progress),
      completionPercentage: enrollment.progress,
      startedAt: enrollment.createdAt,
      completedAt: data.completedAt,
      lastAccessedAt: data.lastAccessedAt,
      createdAt: enrollment.createdAt,
      updatedAt: enrollment.createdAt,
    };
  }

  /**
   * Delete progress record
   */
  async delete(id: string): Promise<void> {
    await prisma.enrollment.delete({
      where: { id },
    });
  }

  /**
   * Get course progress with detailed information
   */
  async getCourseProgress(
    courseId: string,
    userId: string
  ): Promise<CourseProgress | null> {
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: userId,
          courseId: courseId,
        },
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            thumbnail: true,
          },
        },
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!enrollment) return null;

    // Count total lessons and completed lessons
    const totalLessons = await prisma.lesson.count({
      where: {
        module: {
          courseId: courseId,
        },
      },
    });

    const completedLessons = await prisma.lessonProgress.count({
      where: {
        studentId: userId,
        lesson: {
          module: {
            courseId: courseId,
          },
        },
        completed: true,
      },
    });

    return {
      id: enrollment.id,
      studentId: enrollment.studentId,
      courseId: enrollment.courseId,
      course: {
        id: enrollment.course.id,
        title: enrollment.course.title,
        thumbnail: enrollment.course.thumbnail,
      },
      student: {
        id: enrollment.student.id,
        name: enrollment.student.name || "",
        email: enrollment.student.email,
      },
      status: this.mapProgressToStatus(enrollment.progress),
      progress: enrollment.progress,
      completedLessons,
      totalLessons,
      timeSpent: 0, // TODO: Add time tracking
      lastAccessedAt: enrollment.createdAt,
      startedAt: enrollment.createdAt,
      completedAt:
        enrollment.progress >= 100 ? enrollment.createdAt : undefined,
      certificateEarned: enrollment.progress >= 100,
      createdAt: enrollment.createdAt,
      updatedAt: enrollment.createdAt,
    };
  }

  /**
   * Get lesson progress
   */
  async getLessonProgress(
    lessonId: string,
    userId: string
  ): Promise<LessonProgress | null> {
    const lessonProgress = await prisma.lessonProgress.findUnique({
      where: {
        studentId_lessonId: {
          studentId: userId,
          lessonId: lessonId,
        },
      },
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            duration: true,
            module: {
              select: {
                courseId: true,
              },
            },
          },
        },
      },
    });

    if (!lessonProgress) return null;

    return {
      id: lessonProgress.id,
      studentId: lessonProgress.studentId,
      lessonId: lessonProgress.lessonId,
      courseId: lessonProgress.lesson.module.courseId,
      lesson: {
        id: lessonProgress.lesson.id,
        title: lessonProgress.lesson.title,
        type: "VIDEO",
        duration: lessonProgress.lesson.duration,
      },
      isCompleted: lessonProgress.completed,
      completedAt: lessonProgress.completedAt,
      watchTime: 0, // TODO: Add watch time tracking
      lastPosition: 0, // TODO: Add position tracking
      attempts: 1,
      createdAt: lessonProgress.createdAt,
      updatedAt: lessonProgress.createdAt,
    };
  }

  /**
   * Create lesson progress
   */
  async createLessonProgress(
    data: CreateLessonProgressData
  ): Promise<LessonProgress> {
    const lessonProgress = await prisma.lessonProgress.create({
      data: {
        studentId: data.userId,
        lessonId: data.lessonId,
        completed: data.isCompleted,
        completedAt: data.completedAt,
      },
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            duration: true,
            module: {
              select: {
                courseId: true,
              },
            },
          },
        },
      },
    });

    return {
      id: lessonProgress.id,
      studentId: lessonProgress.studentId,
      lessonId: lessonProgress.lessonId,
      courseId: lessonProgress.lesson.module.courseId,
      lesson: {
        id: lessonProgress.lesson.id,
        title: lessonProgress.lesson.title,
        type: "VIDEO",
        duration: lessonProgress.lesson.duration,
      },
      isCompleted: lessonProgress.completed,
      completedAt: lessonProgress.completedAt,
      watchTime: data.watchTime || 0,
      lastPosition: data.lastPosition || 0,
      attempts: 1,
      createdAt: lessonProgress.createdAt,
      updatedAt: lessonProgress.createdAt,
    };
  }

  /**
   * Update lesson progress
   */
  async updateLessonProgress(
    lessonId: string,
    userId: string,
    data: UpdateLessonProgressData
  ): Promise<LessonProgress> {
    const lessonProgress = await prisma.lessonProgress.update({
      where: {
        studentId_lessonId: {
          studentId: userId,
          lessonId: lessonId,
        },
      },
      data: {
        ...(data.isCompleted !== undefined && { completed: data.isCompleted }),
        ...(data.completedAt !== undefined && {
          completedAt: data.completedAt,
        }),
      },
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            duration: true,
            module: {
              select: {
                courseId: true,
              },
            },
          },
        },
      },
    });

    return {
      id: lessonProgress.id,
      studentId: lessonProgress.studentId,
      lessonId: lessonProgress.lessonId,
      courseId: lessonProgress.lesson.module.courseId,
      lesson: {
        id: lessonProgress.lesson.id,
        title: lessonProgress.lesson.title,
        type: "VIDEO",
        duration: lessonProgress.lesson.duration,
      },
      isCompleted: lessonProgress.completed,
      completedAt: lessonProgress.completedAt,
      watchTime: data.watchTime || 0,
      lastPosition: data.lastPosition || 0,
      attempts: 1,
      createdAt: lessonProgress.createdAt,
      updatedAt: lessonProgress.createdAt,
    };
  }

  /**
   * Get user progress across all courses
   */
  async getUserProgress(
    userId: string,
    pagination?: PaginationParams
  ): Promise<UserProgress> {
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId: userId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            thumbnail: true,
          },
        },
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const coursesEnrolled = enrollments.length;
    const coursesCompleted = enrollments.filter(
      (e) => e.progress >= 100
    ).length;
    const coursesInProgress = enrollments.filter(
      (e) => e.progress > 0 && e.progress < 100
    ).length;

    const courses: CourseProgress[] = enrollments.map((enrollment) => ({
      id: enrollment.id,
      studentId: enrollment.studentId,
      courseId: enrollment.courseId,
      course: {
        id: enrollment.course.id,
        title: enrollment.course.title,
        thumbnail: enrollment.course.thumbnail,
      },
      student: {
        id: enrollment.student.id,
        name: enrollment.student.name || "",
        email: enrollment.student.email,
      },
      status: this.mapProgressToStatus(enrollment.progress),
      progress: enrollment.progress,
      completedLessons: 0, // TODO: Calculate from lesson progress
      totalLessons: 0, // TODO: Calculate from course modules
      timeSpent: 0,
      lastAccessedAt: enrollment.createdAt,
      startedAt: enrollment.createdAt,
      completedAt:
        enrollment.progress >= 100 ? enrollment.createdAt : undefined,
      certificateEarned: enrollment.progress >= 100,
      createdAt: enrollment.createdAt,
      updatedAt: enrollment.createdAt,
    }));

    return {
      userId,
      coursesEnrolled,
      coursesCompleted,
      coursesInProgress,
      totalWatchTime: 0, // TODO: Implement watch time tracking
      achievements: 0, // TODO: Implement achievement system
      currentStreak: 0, // TODO: Implement streak tracking
      courses,
    };
  }

  /**
   * Get course progress statistics
   */
  async getCourseProgressStats(
    courseId: string,
    userId: string
  ): Promise<{
    readonly totalLessons: number;
    readonly completedLessons: number;
    readonly totalWatchTime: number;
    readonly totalDuration: number;
  }> {
    const [totalLessons, completedLessons] = await Promise.all([
      prisma.lesson.count({
        where: {
          module: {
            courseId: courseId,
          },
        },
      }),
      prisma.lessonProgress.count({
        where: {
          studentId: userId,
          lesson: {
            module: {
              courseId: courseId,
            },
          },
          completed: true,
        },
      }),
    ]);

    const totalDuration = await prisma.lesson.aggregate({
      where: {
        module: {
          courseId: courseId,
        },
      },
      _sum: {
        duration: true,
      },
    });

    return {
      totalLessons,
      completedLessons,
      totalWatchTime: 0, // TODO: Implement watch time tracking
      totalDuration: totalDuration._sum.duration || 0,
    };
  }

  /**
   * Reset course progress
   */
  async resetCourseProgress(courseId: string, userId: string): Promise<void> {
    await prisma.$transaction([
      // Delete lesson progress
      prisma.lessonProgress.deleteMany({
        where: {
          studentId: userId,
          lesson: {
            module: {
              courseId: courseId,
            },
          },
        },
      }),
      // Reset enrollment progress
      prisma.enrollment.update({
        where: {
          studentId_courseId: {
            studentId: userId,
            courseId: courseId,
          },
        },
        data: {
          progress: 0,
        },
      }),
    ]);
  }

  // Placeholder implementations for remaining methods
  async getInstructorStats(): Promise<any> {
    return {
      totalStudents: 0,
      activeCourses: 0,
      completionRate: 0,
      averageProgress: 0,
    };
  }

  async getCertificateData(): Promise<any> {
    return {
      courseTitle: "",
      userName: "",
      completedAt: new Date(),
      completionPercentage: 100,
      certificateId: "",
    };
  }

  async getProgressAnalytics(): Promise<any> {
    return {
      newEnrollments: 0,
      completions: 0,
      averageCompletionTime: 0,
      dropoffRate: 0,
    };
  }

  async getPopularCoursesByCompletion(): Promise<any> {
    return [];
  }

  /**
   * Map progress percentage to status
   */
  private mapProgressToStatus(
    progress: number
  ): "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" {
    if (progress === 0) return "NOT_STARTED";
    if (progress >= 100) return "COMPLETED";
    return "IN_PROGRESS";
  }
}
