import { prisma } from "@/lib/prisma";

export interface LandingPageContent {
  heroTitle: string;
  heroSubtitle: string;
  heroBadgeText: string;
  heroCtaPrimary: string;
  heroCtaSecondary: string;
  studentsCount: string;
  coursesCount: string;
  instructorsCount: string;
  completionRate: string;
  featuresTitle: string;
  featuresSubtitle: string;
  demoTitle: string;
  demoSubtitle: string;
  footerDescription: string;
}

export interface LandingPageFeature {
  title: string;
  description: string;
  icon: string;
  color: string;
  features: string[];
}

export async function getLandingPageContent() {
  try {
    const content = await prisma.landingPageContent.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });

    const dbFeatures = await prisma.landingPageFeature.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    });

    // Transform database features to match interface
    const features: LandingPageFeature[] =
      dbFeatures.length > 0
        ? dbFeatures.map((feature) => {
            let parsedFeatures: string[] = [];

            try {
              if (typeof feature.features === "string") {
                parsedFeatures = JSON.parse(feature.features);
              } else if (Array.isArray(feature.features)) {
                parsedFeatures = feature.features;
              }
            } catch (error) {
              console.warn(
                `Failed to parse features for ${feature.title}:`,
                error
              );
              parsedFeatures = [];
            }

            return {
              title: feature.title,
              description: feature.description,
              icon: feature.icon,
              color: feature.color,
              features: parsedFeatures,
            };
          })
        : getDefaultFeatures();

    return {
      content: content || getDefaultContent(),
      features,
    };
  } catch (error) {
    console.error("Error fetching landing page content:", error);
    return {
      content: getDefaultContent(),
      features: getDefaultFeatures(),
    };
  }
}

function getDefaultContent(): LandingPageContent {
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

function getDefaultFeatures(): LandingPageFeature[] {
  return [
    {
      title: "Course Management",
      description:
        "Create, organize, and deliver engaging courses with our intuitive course builder.",
      icon: "📚",
      color: "blue",
      features: ["Drag & drop builder", "Video lessons", "Interactive quizzes"],
    },
    {
      title: "Student Analytics",
      description:
        "Track student progress and engagement with detailed analytics and reporting.",
      icon: "📊",
      color: "green",
      features: ["Progress tracking", "Engagement metrics", "Custom reports"],
    },
    {
      title: "Assessment Tools",
      description:
        "Build comprehensive assessments with multiple question types and automatic grading.",
      icon: "✅",
      color: "purple",
      features: ["Multiple choice", "Essay questions", "Auto-grading"],
    },
    {
      title: "Video Streaming",
      description:
        "High-quality video streaming with adaptive bitrate and offline viewing.",
      icon: "🎥",
      color: "orange",
      features: ["HD streaming", "Mobile support", "Offline access"],
    },
    {
      title: "Certification",
      description:
        "Issue certificates and badges to recognize student achievements.",
      icon: "🏆",
      color: "red",
      features: ["Custom certificates", "Digital badges", "Verification"],
    },
    {
      title: "Content Library",
      description:
        "Organize and manage all your learning content in one central location.",
      icon: "📁",
      color: "indigo",
      features: [
        "Structured modules",
        "Rich media support",
        "Content scheduling",
      ],
    },
  ];
}
