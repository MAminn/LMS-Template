import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/templates/landing - Get current landing page content
export async function GET() {
  try {
    const content = await prisma.landingPageContent.findFirst({
      where: { isActive: true },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const features = await prisma.landingPageFeature.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    });

    // Parse JSON strings back to arrays for features
    const parsedFeatures = features.map((feature) => ({
      ...feature,
      features: JSON.parse(feature.features),
    }));

    return NextResponse.json({
      success: true,
      data: {
        content: content || getDefaultContent(),
        features:
          parsedFeatures.length > 0 ? parsedFeatures : getDefaultFeatures(),
      },
    });
  } catch (error) {
    console.error("Error fetching landing page content:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch landing page content" },
      { status: 500 }
    );
  }
}

// POST /api/templates/landing - Save landing page content
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const data = await request.json();

    console.log("Session user:", session.user);

    // First, verify the user exists in the database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    console.log("Database user found:", user ? "Yes" : "No", user?.id);

    if (!user) {
      console.error("User not found in database:", session.user.id);
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 400 }
      );
    }

    // Deactivate current active content
    await prisma.landingPageContent.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    });

    // Create new content
    const newContent = await prisma.landingPageContent.create({
      data: {
        heroTitle: data.heroTitle,
        heroSubtitle: data.heroSubtitle,
        heroBadgeText: data.heroBadgeText,
        heroCtaPrimary: data.heroCtaPrimary,
        heroCtaSecondary: data.heroCtaSecondary,
        studentsCount: data.studentsCount,
        coursesCount: data.coursesCount,
        instructorsCount: data.instructorsCount,
        completionRate: data.completionRate,
        featuresTitle: data.featuresTitle,
        featuresSubtitle: data.featuresSubtitle,
        demoTitle: data.demoTitle,
        demoSubtitle: data.demoSubtitle,
        footerDescription: data.footerDescription,
        isActive: true,
        createdBy: session.user.id,
      },
    });

    // Update features if provided
    if (data.features && Array.isArray(data.features)) {
      // Deactivate existing features
      await prisma.landingPageFeature.updateMany({
        where: { isActive: true },
        data: { isActive: false },
      });

      // Create new features
      await Promise.all(
        data.features.map(
          (
            feature: {
              title: string;
              description: string;
              icon: string;
              color?: string;
              features: string[];
            },
            index: number
          ) =>
            prisma.landingPageFeature.create({
              data: {
                title: feature.title,
                description: feature.description,
                icon: feature.icon,
                color: feature.color || "blue",
                features: JSON.stringify(feature.features), // Convert array to JSON string
                order: index,
                isActive: true,
              },
            })
        )
      );
    }

    return NextResponse.json({
      success: true,
      data: newContent,
    });
  } catch (error) {
    console.error("Error saving landing page content:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save landing page content" },
      { status: 500 }
    );
  }
}

function getDefaultContent() {
  return {
    heroTitle: "Build Your Learning Empire",
    heroSubtitle:
      "Complete Learning Management System with no-code customization, advanced analytics, and seamless content delivery.",
    heroBadgeText: "🚀 Next-Generation Learning Platform",
    heroCtaPrimary: "Explore Courses",
    heroCtaSecondary: "Start Learning",
    studentsCount: "1000+",
    coursesCount: "50+",
    instructorsCount: "25+",
    completionRate: "95%",
    featuresTitle: "Everything You Need to Succeed",
    featuresSubtitle:
      "From course creation to student management, we provide all the tools you need to build and scale your educational platform.",
    demoTitle: "Try The Academy Today",
    demoSubtitle:
      "Experience the full power of our learning management system with these demo accounts.",
    footerDescription:
      "Empowering educators and learners with cutting-edge technology. Build, customize, and scale your learning platform with ease.",
  };
}

function getDefaultFeatures() {
  return [
    {
      title: "Video Learning",
      description:
        "Support for YouTube, Vimeo, and custom video content with interactive lessons and progress tracking.",
      icon: "🎥",
      color: "blue",
      features: [
        "HD video streaming",
        "Progress bookmarks",
        "Mobile responsive player",
      ],
      order: 0,
    },
    {
      title: "Progress Analytics",
      description:
        "Real-time progress tracking with detailed analytics and completion certificates.",
      icon: "📊",
      color: "green",
      features: [
        "Real-time progress",
        "Completion certificates",
        "Performance insights",
      ],
      order: 1,
    },
    {
      title: "No-Code Design",
      description:
        "Complete branding control with drag-and-drop customization tools.",
      icon: "🎨",
      color: "purple",
      features: ["Custom branding", "Drag & drop builder", "Theme templates"],
      order: 2,
    },
    {
      title: "Role Management",
      description:
        "Comprehensive user management with student, instructor, and admin roles.",
      icon: "👥",
      color: "orange",
      features: ["Role-based access", "Permission controls", "User dashboards"],
      order: 3,
    },
    {
      title: "Content Library",
      description:
        "Organize courses with modules, lessons, and rich multimedia content.",
      icon: "📚",
      color: "red",
      features: [
        "Structured modules",
        "Rich media support",
        "Content scheduling",
      ],
      order: 4,
    },
    {
      title: "Mobile Ready",
      description:
        "Fully responsive design that works perfectly on all devices.",
      icon: "📱",
      color: "indigo",
      features: ["Mobile optimized", "Touch friendly", "Offline support"],
      order: 5,
    },
  ];
}
