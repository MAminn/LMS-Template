import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedCourses() {
  // Get the instructor user
  const instructor = await prisma.user.findFirst({
    where: { role: "INSTRUCTOR" },
  });

  if (!instructor) {
    console.log("No instructor found. Please run the main seed script first.");
    return;
  }

  // Create sample courses
  const courses = [
    {
      title: "JavaScript Fundamentals",
      description:
        "Learn the basics of JavaScript programming language. This comprehensive course covers variables, functions, objects, and more.",
      thumbnail:
        "https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=300&fit=crop",
      price: 49.99,
      isPublished: true,
      instructorId: instructor.id,
    },
    {
      title: "React Development",
      description:
        "Master React.js and build modern web applications. Learn components, hooks, state management, and best practices.",
      thumbnail:
        "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop",
      price: 79.99,
      isPublished: true,
      instructorId: instructor.id,
    },
    {
      title: "Node.js Backend Development",
      description:
        "Build powerful backend applications with Node.js. Learn Express, databases, APIs, and deployment.",
      thumbnail:
        "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=300&fit=crop",
      price: 89.99,
      isPublished: false,
      instructorId: instructor.id,
    },
    {
      title: "Full Stack Web Development",
      description:
        "Complete course covering frontend and backend development. Build real-world applications from scratch.",
      thumbnail:
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=300&fit=crop",
      price: 149.99,
      isPublished: true,
      instructorId: instructor.id,
    },
  ];

  for (const courseData of courses) {
    const existingCourse = await prisma.course.findFirst({
      where: {
        title: courseData.title,
        instructorId: instructor.id,
      },
    });

    if (!existingCourse) {
      const course = await prisma.course.create({
        data: courseData,
      });
      console.log(`Created course: ${course.title}`);
    } else {
      console.log(`Course already exists: ${courseData.title}`);
    }
  }

  // Create some sample enrollments
  const student = await prisma.user.findFirst({
    where: { role: "STUDENT" },
  });

  if (student) {
    const publishedCourses = await prisma.course.findMany({
      where: {
        isPublished: true,
        instructorId: instructor.id,
      },
    });

    for (const course of publishedCourses.slice(0, 2)) {
      const existingEnrollment = await prisma.enrollment.findFirst({
        where: {
          studentId: student.id,
          courseId: course.id,
        },
      });

      if (!existingEnrollment) {
        await prisma.enrollment.create({
          data: {
            studentId: student.id,
            courseId: course.id,
            progress: Math.random() * 100,
          },
        });
        console.log(`Enrolled ${student.name} in ${course.title}`);
      }
    }
  }
}

seedCourses()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
