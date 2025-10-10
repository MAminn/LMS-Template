import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface Params {
  id: string;
}

interface AnalyticsData {
  sessionStart?: string;
  sessionEnd?: string;
  totalWatchTime?: number;
  interactions?: Record<string, unknown>;
  deviceType?: string;
  browserType?: string;
  dropOffPoint?: number;
  lastPosition?: number;
  watchedDuration?: number;
}

// POST /api/lessons/[id]/analytics - Track lesson analytics
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const lessonId = resolvedParams.id;
    const data: AnalyticsData = await request.json();

    // Verify lesson exists and user has access
    const lesson = await prisma.lesson.findFirst({
      where: {
        id: lessonId,
        module: {
          course: {
            enrollments: {
              some: {
                studentId: session.user.id,
              },
            },
          },
        },
      },
    });

    if (!lesson) {
      return NextResponse.json(
        { error: "Lesson not found or no access" },
        { status: 404 }
      );
    }

    // Get user agent info
    const userAgent = request.headers.get("user-agent") || "";
    const deviceType = /Mobile|Android|iPhone|iPad/.test(userAgent) 
      ? "mobile" 
      : /Tablet/.test(userAgent) 
      ? "tablet" 
      : "desktop";
    
    const browserType = /Chrome/.test(userAgent) 
      ? "chrome" 
      : /Firefox/.test(userAgent) 
      ? "firefox" 
      : /Safari/.test(userAgent) 
      ? "safari" 
      : "other";

    // Calculate engagement score (0-100)
    let engagementScore = 0;
    if (data.totalWatchTime && lesson.duration) {
      const watchPercentage = (data.totalWatchTime / (lesson.duration * 60)) * 100;
      engagementScore = Math.min(watchPercentage, 100);
    }

    // Update or create analytics record
    const analytics = await prisma.lessonAnalytics.upsert({
      where: {
        lessonId_studentId_sessionStart: {
          lessonId,
          studentId: session.user.id,
          sessionStart: data.sessionStart ? new Date(data.sessionStart) : new Date(),
        },
      },
      update: {
        sessionEnd: data.sessionEnd ? new Date(data.sessionEnd) : new Date(),
        totalWatchTime: data.totalWatchTime,
        interactions: data.interactions || null,
        deviceType,
        browserType,
        engagementScore,
      },
      create: {
        lessonId,
        studentId: session.user.id,
        sessionStart: data.sessionStart ? new Date(data.sessionStart) : new Date(),
        sessionEnd: data.sessionEnd ? new Date(data.sessionEnd) : null,
        totalWatchTime: data.totalWatchTime,
        interactions: data.interactions || null,
        deviceType,
        browserType,
        engagementScore,
      },
    });

    // Update lesson progress
    if (data.dropOffPoint !== undefined || data.lastPosition !== undefined || data.watchedDuration !== undefined) {
      await prisma.lessonProgress.upsert({
        where: {
          studentId_lessonId: {
            studentId: session.user.id,
            lessonId,
          },
        },
        update: {
          timeSpent: data.totalWatchTime || null,
          lastPosition: data.lastPosition || null,
          watchedDuration: data.watchedDuration || null,
          dropOffPoint: data.dropOffPoint || null,
        },
        create: {
          studentId: session.user.id,
          lessonId,
          timeSpent: data.totalWatchTime || null,
          lastPosition: data.lastPosition || null,
          watchedDuration: data.watchedDuration || null,
          dropOffPoint: data.dropOffPoint || null,
        },
      });
    }

    return NextResponse.json(analytics);
  } catch (error) {
    console.error("Error tracking analytics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET /api/lessons/[id]/analytics - Get lesson analytics (instructor only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "INSTRUCTOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const lessonId = resolvedParams.id;

    // Verify instructor owns the lesson
    const lesson = await prisma.lesson.findFirst({
      where: {
        id: lessonId,
        module: {
          course: {
            instructorId: session.user.id,
          },
        },
      },
    });

    if (!lesson) {
      return NextResponse.json(
        { error: "Lesson not found or unauthorized" },
        { status: 404 }
      );
    }

    // Get analytics data
    const analytics = await prisma.lessonAnalytics.findMany({
      where: { lessonId },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { sessionStart: "desc" },
    });

    // Calculate aggregated metrics
    const totalSessions = analytics.length;
    const uniqueStudents = new Set(analytics.map(a => a.studentId)).size;
    const avgWatchTime = analytics.reduce((sum, a) => sum + (a.totalWatchTime || 0), 0) / totalSessions;
    const avgEngagement = analytics.reduce((sum, a) => sum + (a.engagementScore || 0), 0) / totalSessions;
    
    // Device breakdown
    const deviceBreakdown = analytics.reduce((acc, a) => {
      acc[a.deviceType || "unknown"] = (acc[a.deviceType || "unknown"] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Drop-off analysis
    const dropOffs = await prisma.lessonProgress.findMany({
      where: { 
        lessonId,
        dropOffPoint: { not: null }
      },
      select: { dropOffPoint: true },
    });

    const dropOffPoints = dropOffs.map(d => d.dropOffPoint).filter(Boolean) as number[];

    return NextResponse.json({
      analytics,
      summary: {
        totalSessions,
        uniqueStudents,
        avgWatchTime: Math.round(avgWatchTime),
        avgEngagement: Math.round(avgEngagement * 100) / 100,
        deviceBreakdown,
        dropOffPoints,
      },
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}