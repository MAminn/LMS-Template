import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { AnalyticsService } from "@/lib/analytics-service";

// GET /api/analytics - Get analytics data
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // overview, enrollment, performance, engagement, all
    const instructorId = searchParams.get("instructorId");

    // Check permissions
    const isAdmin = session.user.role === "ADMIN";
    const isInstructor = session.user.role === "INSTRUCTOR";
    const isOwnData = instructorId === session.user.id;

    // Only admins can see all data, instructors can only see their own data
    if (!isAdmin && (!isInstructor || !isOwnData)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Determine which instructor's data to fetch
    const targetInstructorId = isAdmin
      ? instructorId || undefined
      : session.user.id;

    let analytics;

    switch (type) {
      case "overview":
        analytics = {
          overview: await AnalyticsService.getOverviewStats(targetInstructorId),
        };
        break;
      case "enrollment":
        analytics = {
          enrollment: await AnalyticsService.getEnrollmentAnalytics(
            targetInstructorId
          ),
        };
        break;
      case "performance":
        analytics = {
          performance: await AnalyticsService.getPerformanceAnalytics(
            targetInstructorId
          ),
        };
        break;
      case "engagement":
        analytics = {
          engagement: await AnalyticsService.getEngagementAnalytics(
            targetInstructorId
          ),
        };
        break;
      case "all":
      default:
        analytics = await AnalyticsService.getFullAnalytics(targetInstructorId);
        break;
    }

    return NextResponse.json({ success: true, data: analytics });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
