import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function createDemoContent() {
  console.log("🚀 Creating comprehensive demo content for LMS Template...\n");

  try {
    // 1. Create demo users
    console.log("👥 Creating demo users...");

    const hashedPassword = await bcrypt.hash("demo123", 10);

    // Admin user
    const admin = await prisma.user.upsert({
      where: { email: "admin@academy.com" },
      update: {},
      create: {
        email: "admin@academy.com",
        name: "Sarah Admin",
        password: hashedPassword,
        role: "ADMIN",
      },
    });

    // Instructor users
    const instructor1 = await prisma.user.upsert({
      where: { email: "john.instructor@academy.com" },
      update: {},
      create: {
        email: "john.instructor@academy.com",
        name: "John Smith",
        password: hashedPassword,
        role: "INSTRUCTOR",
      },
    });

    const instructor2 = await prisma.user.upsert({
      where: { email: "maria.garcia@academy.com" },
      update: {},
      create: {
        email: "maria.garcia@academy.com",
        name: "Maria Garcia",
        password: hashedPassword,
        role: "INSTRUCTOR",
      },
    });

    // Student users
    const student1 = await prisma.user.upsert({
      where: { email: "alex.student@academy.com" },
      update: {},
      create: {
        email: "alex.student@academy.com",
        name: "Alex Johnson",
        password: hashedPassword,
        role: "STUDENT",
      },
    });

    const student2 = await prisma.user.upsert({
      where: { email: "emma.wilson@academy.com" },
      update: {},
      create: {
        email: "emma.wilson@academy.com",
        name: "Emma Wilson",
        password: hashedPassword,
        role: "STUDENT",
      },
    });

    console.log("✅ Demo users created");

    // 2. Create demo courses
    console.log("📚 Creating demo courses...");

    const course1 = await prisma.course.create({
      data: {
        title: "Complete Web Development Bootcamp",
        description:
          "Master HTML, CSS, JavaScript, React, Node.js, and MongoDB in this comprehensive full-stack development course. Build real-world projects and deploy them to production.",
        thumbnail:
          "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=600&fit=crop",
        price: 99.99,
        isPublished: true,
        instructorId: instructor1.id,
      },
    });

    const course2 = await prisma.course.create({
      data: {
        title: "Digital Marketing Mastery",
        description:
          "Learn SEO, Social Media Marketing, Content Strategy, Email Marketing, and Analytics. Grow your business with proven digital marketing strategies.",
        thumbnail:
          "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=800&h=600&fit=crop",
        price: 79.99,
        isPublished: true,
        instructorId: instructor2.id,
      },
    });

    const course3 = await prisma.course.create({
      data: {
        title: "Data Science with Python",
        description:
          "Master data analysis, machine learning, and data visualization using Python, Pandas, NumPy, and Scikit-learn. Work with real datasets.",
        thumbnail:
          "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop",
        price: 129.99,
        isPublished: true,
        instructorId: instructor1.id,
      },
    });

    console.log("✅ Demo courses created");

    // 3. Create modules and lessons for Course 1 (Web Development)
    console.log("📖 Creating course modules and lessons...");

    const module1 = await prisma.module.create({
      data: {
        title: "HTML & CSS Fundamentals",
        description: "Learn the building blocks of web development",
        order: 1,
        courseId: course1.id,
      },
    });

    const module2 = await prisma.module.create({
      data: {
        title: "JavaScript Essentials",
        description: "Master JavaScript programming fundamentals",
        order: 2,
        courseId: course1.id,
      },
    });

    const module3 = await prisma.module.create({
      data: {
        title: "React Development",
        description: "Build modern web applications with React",
        order: 3,
        courseId: course1.id,
      },
    });

    // Lessons for Module 1
    await prisma.lesson.createMany({
      data: [
        {
          title: "Introduction to HTML",
          description: "Learn HTML structure and semantic elements",
          content:
            "HTML (HyperText Markup Language) is the standard markup language for creating web pages...",
          videoUrl: "https://www.youtube.com/watch?v=UB1O30fR-EE",
          duration: 25,
          order: 1,
          moduleId: module1.id,
        },
        {
          title: "CSS Styling and Layout",
          description: "Master CSS for beautiful web designs",
          content:
            "CSS (Cascading Style Sheets) is used to style and layout web pages...",
          videoUrl: "https://www.youtube.com/watch?v=yfoY53QXEnI",
          duration: 35,
          order: 2,
          moduleId: module1.id,
        },
        {
          title: "Responsive Design with Flexbox",
          description: "Create responsive layouts using CSS Flexbox",
          content:
            "Flexbox is a powerful layout method in CSS that allows you to design flexible responsive layout structure...",
          videoUrl: "https://www.youtube.com/watch?v=JJSoEo8JSnc",
          duration: 40,
          order: 3,
          moduleId: module1.id,
        },
      ],
    });

    // Lessons for Module 2
    await prisma.lesson.createMany({
      data: [
        {
          title: "JavaScript Variables and Data Types",
          description: "Understanding JavaScript fundamentals",
          content:
            "JavaScript is a programming language that adds interactivity to your website...",
          videoUrl: "https://www.youtube.com/watch?v=W6NZfCO5SIk",
          duration: 30,
          order: 1,
          moduleId: module2.id,
        },
        {
          title: "Functions and Scope",
          description: "Master JavaScript functions and variable scope",
          content:
            "Functions are reusable blocks of code that perform specific tasks...",
          videoUrl: "https://www.youtube.com/watch?v=xUI5Tsl2JpY",
          duration: 45,
          order: 2,
          moduleId: module2.id,
        },
        {
          title: "DOM Manipulation",
          description: "Learn to interact with web page elements",
          content:
            "The Document Object Model (DOM) is a programming interface for web documents...",
          videoUrl: "https://www.youtube.com/watch?v=0ik6X4DJKCc",
          duration: 50,
          order: 3,
          moduleId: module2.id,
        },
      ],
    });

    // Lessons for Module 3
    await prisma.lesson.createMany({
      data: [
        {
          title: "Introduction to React",
          description: "Get started with React library",
          content:
            "React is a JavaScript library for building user interfaces...",
          videoUrl: "https://www.youtube.com/watch?v=Tn6-PIqc4UM",
          duration: 60,
          order: 1,
          moduleId: module3.id,
        },
        {
          title: "React Components and Props",
          description: "Build reusable React components",
          content:
            "Components let you split the UI into independent, reusable pieces...",
          videoUrl: "https://www.youtube.com/watch?v=5yMzVklQNto",
          duration: 55,
          order: 2,
          moduleId: module3.id,
        },
      ],
    });

    console.log("✅ Course content created");

    // 4. Create student enrollments and progress
    console.log("📈 Creating student enrollments and progress...");

    await prisma.enrollment.createMany({
      data: [
        { studentId: student1.id, courseId: course1.id, progress: 65 },
        { studentId: student1.id, courseId: course2.id, progress: 30 },
        { studentId: student2.id, courseId: course1.id, progress: 80 },
        { studentId: student2.id, courseId: course3.id, progress: 15 },
      ],
    });

    // Get first few lessons for progress tracking
    const lessons = await prisma.lesson.findMany({
      where: {
        module: { courseId: course1.id },
      },
      orderBy: [{ module: { order: "asc" } }, { order: "asc" }],
      take: 4,
    });

    // Create lesson progress for students
    if (lessons.length > 0) {
      await prisma.lessonProgress.createMany({
        data: [
          // Student 1 progress
          {
            studentId: student1.id,
            lessonId: lessons[0].id,
            completed: true,
            completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
          {
            studentId: student1.id,
            lessonId: lessons[1].id,
            completed: true,
            completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          },
          {
            studentId: student1.id,
            lessonId: lessons[2].id,
            completed: true,
            completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          },

          // Student 2 progress
          {
            studentId: student2.id,
            lessonId: lessons[0].id,
            completed: true,
            completedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          },
          {
            studentId: student2.id,
            lessonId: lessons[1].id,
            completed: true,
            completedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
          },
          {
            studentId: student2.id,
            lessonId: lessons[2].id,
            completed: true,
            completedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
          },
          {
            studentId: student2.id,
            lessonId: lessons[3].id,
            completed: true,
            completedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
          },
        ],
      });
    }

    console.log("✅ Student progress created");

    // 5. Create demo quizzes
    console.log("🧩 Creating demo quizzes...");

    if (lessons.length > 0) {
      const quiz1 = await prisma.quiz.create({
        data: {
          title: "HTML Fundamentals Quiz",
          description: "Test your knowledge of HTML basics",
          lessonId: lessons[0].id,
          timeLimit: 15,
          passingScore: 70,
          questions: {
            create: [
              {
                question: "What does HTML stand for?",
                type: "MULTIPLE_CHOICE",
                points: 1,
                order: 1,
                options: {
                  create: [
                    {
                      text: "HyperText Markup Language",
                      isCorrect: true,
                      order: 1,
                    },
                    {
                      text: "High Tech Modern Language",
                      isCorrect: false,
                      order: 2,
                    },
                    {
                      text: "Home Tool Markup Language",
                      isCorrect: false,
                      order: 3,
                    },
                    {
                      text: "Hyperlink and Text Markup Language",
                      isCorrect: false,
                      order: 4,
                    },
                  ],
                },
              },
              {
                question: "Which HTML element is used for the largest heading?",
                type: "MULTIPLE_CHOICE",
                points: 1,
                order: 2,
                options: {
                  create: [
                    { text: "<h1>", isCorrect: true, order: 1 },
                    { text: "<h6>", isCorrect: false, order: 2 },
                    { text: "<heading>", isCorrect: false, order: 3 },
                    { text: "<head>", isCorrect: false, order: 4 },
                  ],
                },
              },
              {
                question: "HTML is a programming language",
                type: "TRUE_FALSE",
                points: 1,
                order: 3,
                options: {
                  create: [
                    { text: "True", isCorrect: false, order: 1 },
                    { text: "False", isCorrect: true, order: 2 },
                  ],
                },
              },
            ],
          },
        },
      });

      // Create a quiz attempt for demonstration
      await prisma.quizAttempt.create({
        data: {
          studentId: student1.id,
          quizId: quiz1.id,
          score: 85,
          timeSpent: 8 * 60, // 8 minutes
          completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          passed: true,
          answers: {
            create: [
              {
                questionId: (await prisma.quizQuestion.findFirst({
                  where: { quizId: quiz1.id, order: 1 },
                }))!.id,
                selectedText: "HyperText Markup Language",
                isCorrect: true,
                points: 1,
              },
              {
                questionId: (await prisma.quizQuestion.findFirst({
                  where: { quizId: quiz1.id, order: 2 },
                }))!.id,
                selectedText: "<h1>",
                isCorrect: true,
                points: 1,
              },
              {
                questionId: (await prisma.quizQuestion.findFirst({
                  where: { quizId: quiz1.id, order: 3 },
                }))!.id,
                selectedText: "True",
                isCorrect: false,
                points: 0,
              },
            ],
          },
        },
      });
    }

    console.log("✅ Demo quizzes created");

    // 6. Update landing page content
    console.log("🎨 Updating landing page content...");

    await prisma.landingPageContent.deleteMany({});

    await prisma.landingPageContent.create({
      data: {
        heroTitle: "Transform Your Learning Journey",
        heroSubtitle:
          "Experience the future of education with our cutting-edge Learning Management System. Interactive courses, real-time progress tracking, and professional certification.",
        heroBadgeText: "🎓 Award-Winning Platform",
        heroCtaPrimary: "Explore Courses",
        heroCtaSecondary: "Try Demo",
        studentsCount: "2,500+",
        coursesCount: "150+",
        instructorsCount: "45+",
        completionRate: "94%",
        featuresTitle: "Everything You Need to Excel",
        featuresSubtitle:
          "From interactive video lessons to comprehensive assessments, we provide all the tools for successful learning outcomes.",
        demoTitle: "Experience The Academy",
        demoSubtitle:
          "Try our platform with these demo accounts and see the power of modern learning technology.",
        footerDescription:
          "Empowering learners worldwide with cutting-edge educational technology. Build, customize, and scale your learning platform with ease.",
        isActive: true,
        createdBy: admin.id,
      },
    });

    console.log("✅ Landing page content updated");

    console.log("\n🎉 Demo content creation completed successfully!");
    console.log("\n📋 Demo Account Credentials:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("👨‍💼 Admin: admin@academy.com / demo123");
    console.log("👩‍🏫 Instructor: john.instructor@academy.com / demo123");
    console.log("👩‍🏫 Instructor: maria.garcia@academy.com / demo123");
    console.log("👨‍🎓 Student: alex.student@academy.com / demo123");
    console.log("👩‍🎓 Student: emma.wilson@academy.com / demo123");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  } catch (error) {
    console.error("❌ Error creating demo content:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createDemoContent();
