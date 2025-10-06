import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getServices } from "@/infrastructure/services/ServiceFactory";

// GET /api/templates/branding - Get current branding settings
export async function GET() {
  try {
    const { brandingService } = getServices();
    const branding = await brandingService.getActiveBranding();

    return NextResponse.json({
      success: true,
      data: branding,
    });
  } catch (error) {
    console.error("Error fetching branding settings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch branding settings" },
      { status: 500 }
    );
  }
}

// POST /api/templates/branding - Save branding settings
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const data = await request.json();
    const { brandingService } = getServices();

    const newBranding = await brandingService.createBranding(
      {
        logoUrl: data.logoUrl,
        logoText: data.logoText || "The Academy",
        logoType: data.logoType || "text",
        primaryColor: data.primaryColor || "#3b82f6",
        secondaryColor: data.secondaryColor || "#1e40af",
        siteName: data.siteName || "The Academy",
        siteDescription:
          data.siteDescription || "Learn anything, anywhere, anytime",
        fontFamily: data.fontFamily || "Inter",
        faviconUrl: data.faviconUrl,
        heroBackgroundUrl: data.heroBackgroundUrl,
        createdBy: session.user.id,
      },
      session.user.id
    );

    return NextResponse.json({
      success: true,
      data: newBranding,
    });
  } catch (error: unknown) {
    console.error("Error saving branding settings:", error);

    const statusCode =
      error instanceof Error && "statusCode" in error
        ? (error as Error & { statusCode: number }).statusCode
        : 500;
    const message =
      error instanceof Error
        ? error.message
        : "Failed to save branding settings";

    return NextResponse.json(
      { success: false, error: message },
      { status: statusCode }
    );
  }
}
