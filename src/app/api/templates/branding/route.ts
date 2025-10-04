import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

// GET /api/templates/branding - Get current branding settings
export async function GET() {
  try {
    const settings = await prisma.brandingSetting.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: settings || {
        primaryColor: "#3b82f6",
        siteName: "The Academy",
      },
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

    // Deactivate current active settings
    await prisma.brandingSetting.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    });

    // Create new settings
    const newSettings = await prisma.brandingSetting.create({
      data: {
        logoUrl: data.logoUrl,
        primaryColor: data.primaryColor || "#3b82f6",
        siteName: data.siteName,
        isActive: true,
        createdBy: session.user.id,
      },
    });

    return NextResponse.json({
      success: true,
      data: newSettings,
    });
  } catch (error) {
    console.error("Error saving branding settings:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save branding settings" },
      { status: 500 }
    );
  }
}
