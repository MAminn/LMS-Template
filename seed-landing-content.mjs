// Seed landing page content
import { PrismaClient } from "./src/generated/prisma/index.js";

const prisma = new PrismaClient();

async function seedLandingPageContent() {
  try {
    console.log("Seeding landing page content...");

    // Find admin user
    const admin = await prisma.user.findFirst({
      where: { role: "ADMIN" },
    });

    if (!admin) {
      console.error("No admin user found!");
      return;
    }

    // Create landing page content
    const content = await prisma.landingPageContent.create({
      data: {
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
        isActive: true,
        createdBy: admin.id,
      },
    });

    console.log("Created landing page content:", content.id);

    // Create landing page features
    const features = [
      {
        title: "Video Learning",
        description:
          "Support for YouTube, Vimeo, and custom video content with interactive lessons and progress tracking.",
        icon: "🎥",
        color: "blue",
        features: JSON.stringify([
          "HD video streaming",
          "Progress bookmarks",
          "Mobile responsive player",
        ]),
        order: 1,
      },
      {
        title: "Progress Analytics",
        description:
          "Real-time progress tracking with detailed analytics and completion certificates.",
        icon: "📊",
        color: "green",
        features: JSON.stringify([
          "Real-time progress",
          "Completion certificates",
          "Performance insights",
        ]),
        order: 2,
      },
      {
        title: "No-Code Design",
        description:
          "Complete branding control with drag-and-drop customization tools.",
        icon: "🎨",
        color: "purple",
        features: JSON.stringify([
          "Custom branding",
          "Drag & drop builder",
          "Theme templates",
        ]),
        order: 3,
      },
      {
        title: "Role Management",
        description:
          "Comprehensive user management with student, instructor, and admin roles.",
        icon: "👥",
        color: "orange",
        features: JSON.stringify([
          "Role-based access",
          "Permission controls",
          "User dashboards",
        ]),
        order: 4,
      },
      {
        title: "Content Library",
        description:
          "Organize courses with modules, lessons, and rich multimedia content.",
        icon: "📚",
        color: "red",
        features: JSON.stringify([
          "Structured modules",
          "Rich media support",
          "Content scheduling",
        ]),
        order: 5,
      },
      {
        title: "Mobile Ready",
        description:
          "Fully responsive design that works perfectly on all devices.",
        icon: "📱",
        color: "indigo",
        features: JSON.stringify([
          "Mobile optimized",
          "Touch friendly",
          "Offline support",
        ]),
        order: 6,
      },
    ];

    for (const feature of features) {
      const created = await prisma.landingPageFeature.create({
        data: feature,
      });
      console.log("Created feature:", created.title);
    }

    console.log("✅ Landing page content seeded successfully!");
  } catch (error) {
    console.error("Error seeding landing page content:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seedLandingPageContent();
