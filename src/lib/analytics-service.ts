import { prisma } from "@/lib/prisma";

export interface AnalyticsData {
  overview: {
    totalStudents: number;
    totalCourses: number;
    totalRevenue: number;
    completionRate: number;
  };
  enrollment: {
    monthly: Array<{
      month: string;
      enrollments: number;
      revenue: number;
    }>;
    topCourses: Array<{
      courseId: string;
      title: string;
      enrollments: number;
      revenue: number;
    }>;
  };
  performance: {
    courseProgress: Array<{
      courseId: string;
      title: string;
      averageProgress: number;
      completions: number;
      dropoffRate: number;
    }>;
    quizPerformance: Array<{
      quizId: string;
      title: string;
      averageScore: number;
      attempts: number;
      passRate: number;
    }>;
  };
  engagement: {
    dailyActiveUsers: Array<{
      date: string;
      activeUsers: number;
    }>;
    lessonEngagement: Array<{
      lessonId: string;
      title: string;
      views: number;
      averageWatchTime: number;
      completionRate: number;
    }>;
  };
}

export class AnalyticsService {
  static async getOverviewStats(
    instructorId?: string
  ): Promise<AnalyticsData["overview"]> {
    const whereClause = instructorId ? { instructorId } : {};

    const [totalStudents, totalCourses, payments, enrollments] =
      await Promise.all([
        // Count unique students across all courses (or instructor's courses)
        prisma.enrollment
          .groupBy({
            by: ["studentId"],
            where: instructorId
              ? {
                  course: { instructorId },
                }
              : {},
          })
          .then((results) => results.length),

        // Count total courses
        prisma.course.count({
          where: whereClause,
        }),

        // Get total revenue
        prisma.payment.aggregate({
          _sum: { amount: true },
          where: {
            status: "COMPLETED",
            ...(whereClause && { course: whereClause }),
          },
        }),

        // Get enrollments for completion rate
        prisma.enrollment.findMany({
          where: instructorId
            ? {
                course: { instructorId },
              }
            : {},
          select: { progress: true },
        }),
      ]);

    const totalRevenue = payments._sum.amount || 0;
    const completionRate =
      enrollments.length > 0
        ? (enrollments.filter((e) => e.progress >= 100).length /
            enrollments.length) *
          100
        : 0;

    return {
      totalStudents,
      totalCourses,
      totalRevenue,
      completionRate: Math.round(completionRate * 100) / 100,
    };
  }

  static async getEnrollmentAnalytics(
    instructorId?: string
  ): Promise<AnalyticsData["enrollment"]> {
    const whereClause = instructorId ? { course: { instructorId } } : {};

    // Get monthly enrollment data for the last 12 months
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const monthlyEnrollments = await prisma.enrollment.groupBy({
      by: ["createdAt"],
      where: {
        ...whereClause,
        createdAt: {
          gte: twelveMonthsAgo,
        },
      },
      _count: true,
    });

    // Group by month and get corresponding revenue
    const monthlyData = new Map<
      string,
      { enrollments: number; revenue: number }
    >();

    for (const enrollment of monthlyEnrollments) {
      const monthKey = enrollment.createdAt.toISOString().substring(0, 7); // YYYY-MM
      const existing = monthlyData.get(monthKey) || {
        enrollments: 0,
        revenue: 0,
      };
      monthlyData.set(monthKey, {
        enrollments: existing.enrollments + enrollment._count,
        revenue: existing.revenue, // Will be calculated separately
      });
    }

    // Get revenue data for the same period
    const payments = await prisma.payment.findMany({
      where: {
        status: "COMPLETED",
        createdAt: {
          gte: twelveMonthsAgo,
        },
        ...(instructorId && { course: { instructorId } }),
      },
      select: { amount: true, createdAt: true },
    });

    // Add revenue to monthly data
    for (const payment of payments) {
      const monthKey = payment.createdAt.toISOString().substring(0, 7);
      const existing = monthlyData.get(monthKey) || {
        enrollments: 0,
        revenue: 0,
      };
      monthlyData.set(monthKey, {
        enrollments: existing.enrollments,
        revenue: existing.revenue + payment.amount,
      });
    }

    const monthly = Array.from(monthlyData.entries())
      .map(([month, data]) => ({
        month,
        enrollments: data.enrollments,
        revenue: data.revenue,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // Get top courses by enrollment
    const topCourses = await prisma.course.findMany({
      where: instructorId ? { instructorId } : {},
      select: {
        id: true,
        title: true,
        _count: {
          select: { enrollments: true },
        },
        payments: {
          where: { status: "COMPLETED" },
          select: { amount: true },
        },
      },
      orderBy: {
        enrollments: { _count: "desc" },
      },
      take: 10,
    });

    const topCoursesData = topCourses.map((course) => ({
      courseId: course.id,
      title: course.title,
      enrollments: course._count.enrollments,
      revenue: course.payments.reduce(
        (sum, payment) => sum + payment.amount,
        0
      ),
    }));

    return {
      monthly,
      topCourses: topCoursesData,
    };
  }

  static async getPerformanceAnalytics(
    instructorId?: string
  ): Promise<AnalyticsData["performance"]> {
    const whereClause = instructorId ? { instructorId } : {};

    // Course progress analytics
    const courses = await prisma.course.findMany({
      where: whereClause,
      select: {
        id: true,
        title: true,
        enrollments: {
          select: { progress: true },
        },
      },
    });

    const courseProgress = courses.map((course) => {
      const enrollments = course.enrollments;
      const totalEnrollments = enrollments.length;
      const completions = enrollments.filter((e) => e.progress >= 100).length;
      const averageProgress =
        totalEnrollments > 0
          ? enrollments.reduce((sum, e) => sum + e.progress, 0) /
            totalEnrollments
          : 0;
      const dropoffRate =
        totalEnrollments > 0
          ? ((totalEnrollments - completions) / totalEnrollments) * 100
          : 0;

      return {
        courseId: course.id,
        title: course.title,
        averageProgress: Math.round(averageProgress * 100) / 100,
        completions,
        dropoffRate: Math.round(dropoffRate * 100) / 100,
      };
    });

    // Quiz performance analytics
    const quizzes = await prisma.quiz.findMany({
      where: instructorId
        ? {
            lesson: {
              module: {
                course: { instructorId },
              },
            },
          }
        : {},
      select: {
        id: true,
        title: true,
        passingScore: true,
        attempts: {
          select: {
            score: true,
            passed: true,
          },
        },
      },
    });

    const quizPerformance = quizzes.map((quiz) => {
      const attempts = quiz.attempts;
      const totalAttempts = attempts.length;
      const passedAttempts = attempts.filter((a) => a.passed).length;
      const averageScore =
        totalAttempts > 0
          ? attempts.reduce((sum, a) => sum + a.score, 0) / totalAttempts
          : 0;
      const passRate =
        totalAttempts > 0 ? (passedAttempts / totalAttempts) * 100 : 0;

      return {
        quizId: quiz.id,
        title: quiz.title,
        averageScore: Math.round(averageScore * 100) / 100,
        attempts: totalAttempts,
        passRate: Math.round(passRate * 100) / 100,
      };
    });

    return {
      courseProgress,
      quizPerformance,
    };
  }

  static async getEngagementAnalytics(
    instructorId?: string
  ): Promise<AnalyticsData["engagement"]> {
    // Get daily active users for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const lessonProgress = await prisma.lessonProgress.findMany({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
        ...(instructorId && {
          lesson: {
            module: {
              course: { instructorId },
            },
          },
        }),
      },
      select: {
        studentId: true,
        createdAt: true,
        lessonId: true,
        lesson: {
          select: {
            title: true,
            duration: true,
          },
        },
      },
    });

    // Group by date for daily active users
    const dailyActiveUsers = new Map<string, Set<string>>();

    for (const progress of lessonProgress) {
      const dateKey = progress.createdAt.toISOString().substring(0, 10); // YYYY-MM-DD
      if (!dailyActiveUsers.has(dateKey)) {
        dailyActiveUsers.set(dateKey, new Set());
      }
      dailyActiveUsers.get(dateKey)!.add(progress.studentId);
    }

    const dailyActiveUsersData = Array.from(dailyActiveUsers.entries())
      .map(([date, users]) => ({
        date,
        activeUsers: users.size,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Lesson engagement analytics
    const lessonEngagementMap = new Map<
      string,
      {
        lessonId: string;
        title: string;
        views: number;
        totalDuration: number;
        completions: number;
      }
    >();

    for (const progress of lessonProgress) {
      const key = progress.lessonId;
      const existing = lessonEngagementMap.get(key) || {
        lessonId: progress.lessonId,
        title: progress.lesson.title,
        views: 0,
        totalDuration: 0,
        completions: 0,
      };

      lessonEngagementMap.set(key, {
        ...existing,
        views: existing.views + 1,
        totalDuration: existing.totalDuration + (progress.lesson.duration || 0),
        completions: existing.completions, // Will be calculated separately
      });
    }

    // Get completion data
    const completedLessons = await prisma.lessonProgress.groupBy({
      by: ["lessonId"],
      where: {
        completed: true,
        ...(instructorId && {
          lesson: {
            module: {
              course: { instructorId },
            },
          },
        }),
      },
      _count: true,
    });

    // Update completion counts
    for (const completion of completedLessons) {
      const existing = lessonEngagementMap.get(completion.lessonId);
      if (existing) {
        existing.completions = completion._count;
      }
    }

    const lessonEngagement = Array.from(lessonEngagementMap.values())
      .map((lesson) => ({
        lessonId: lesson.lessonId,
        title: lesson.title,
        views: lesson.views,
        averageWatchTime:
          lesson.views > 0
            ? Math.round(lesson.totalDuration / lesson.views)
            : 0,
        completionRate:
          lesson.views > 0
            ? Math.round((lesson.completions / lesson.views) * 100 * 100) / 100
            : 0,
      }))
      .sort((a, b) => b.views - a.views);

    return {
      dailyActiveUsers: dailyActiveUsersData,
      lessonEngagement,
    };
  }

  static async getFullAnalytics(instructorId?: string): Promise<AnalyticsData> {
    const [overview, enrollment, performance, engagement] = await Promise.all([
      this.getOverviewStats(instructorId),
      this.getEnrollmentAnalytics(instructorId),
      this.getPerformanceAnalytics(instructorId),
      this.getEngagementAnalytics(instructorId),
    ]);

    return {
      overview,
      enrollment,
      performance,
      engagement,
    };
  }
}
