import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedCourseContent() {
  console.log("Seeding course content...");

  // Get a sample course
  const course = await prisma.course.findFirst({
    where: {
      title: "JavaScript Fundamentals",
    },
  });

  if (!course) {
    console.log("No course found to add content to");
    return;
  }

  // Create modules
  const modules = [
    {
      title: "Introduction to JavaScript",
      description: "Learn the basics of JavaScript programming",
      order: 1,
      courseId: course.id,
      lessons: [
        {
          title: "What is JavaScript?",
          description:
            "Understanding JavaScript and its role in web development",
          content:
            "JavaScript is a programming language that enables you to create dynamically updating content, control multimedia, animate images, and pretty much everything else.",
          videoUrl: "https://www.youtube.com/watch?v=W6NZfCO5SIk",
          duration: 15,
          order: 1,
        },
        {
          title: "Setting up Your Development Environment",
          description: "Installing Node.js and setting up VS Code",
          content:
            "To start coding in JavaScript, you'll need a proper development environment. We'll set up Node.js and Visual Studio Code.",
          videoUrl: "https://www.youtube.com/watch?v=TlB_eWDSMt4",
          duration: 20,
          order: 2,
        },
        {
          title: "Your First JavaScript Program",
          description: "Writing and running your first JavaScript code",
          content:
            "Let's write our first JavaScript program and understand how code execution works.",
          videoUrl: "https://www.youtube.com/watch?v=hdI2bqOjy3c",
          duration: 25,
          order: 3,
        },
      ],
    },
    {
      title: "Variables and Data Types",
      description:
        "Understanding how to store and work with data in JavaScript",
      order: 2,
      courseId: course.id,
      lessons: [
        {
          title: "Declaring Variables",
          description: "Learn about var, let, and const",
          content:
            "Variables are containers for storing data values. In JavaScript, we can declare variables using var, let, or const keywords.",
          videoUrl: "https://www.youtube.com/watch?v=9WIJQDvt4Us",
          duration: 18,
          order: 1,
        },
        {
          title: "Primitive Data Types",
          description: "Numbers, strings, booleans, and more",
          content:
            "JavaScript has several primitive data types: number, string, boolean, undefined, null, and symbol.",
          videoUrl: "https://www.youtube.com/watch?v=808eYu9B9Yw",
          duration: 22,
          order: 2,
        },
        {
          title: "Working with Strings",
          description: "String methods and template literals",
          content:
            "Strings are used to represent text data. JavaScript provides many built-in methods to work with strings.",
          videoUrl: "https://www.youtube.com/watch?v=09BwruU4kiY",
          duration: 30,
          order: 3,
        },
      ],
    },
    {
      title: "Functions and Control Flow",
      description: "Learn about functions, conditionals, and loops",
      order: 3,
      courseId: course.id,
      lessons: [
        {
          title: "Introduction to Functions",
          description: "Creating and calling functions",
          content:
            "Functions are reusable blocks of code that perform specific tasks. They are fundamental building blocks of JavaScript programs.",
          videoUrl: "https://www.youtube.com/watch?v=N8ap4k_1QEQ",
          duration: 28,
          order: 1,
        },
        {
          title: "Conditional Statements",
          description: "If, else if, and else statements",
          content:
            "Conditional statements allow you to execute different code blocks based on different conditions.",
          videoUrl: "https://www.youtube.com/watch?v=IsG4Xd6LlsM",
          duration: 25,
          order: 2,
        },
        {
          title: "Loops in JavaScript",
          description: "For loops, while loops, and iteration",
          content:
            "Loops allow you to repeat code multiple times. JavaScript provides several types of loops for different use cases.",
          videoUrl: "https://www.youtube.com/watch?v=s9wW2PpJsmQ",
          duration: 35,
          order: 3,
        },
      ],
    },
  ];

  for (const moduleData of modules) {
    const { lessons, ...moduleInfo } = moduleData;

    // Check if module already exists
    const existingModule = await prisma.module.findFirst({
      where: {
        title: moduleInfo.title,
        courseId: moduleInfo.courseId,
      },
    });

    if (existingModule) {
      console.log(`Module already exists: ${moduleInfo.title}`);
      continue;
    }

    // Create module
    const createdModule = await prisma.module.create({
      data: moduleInfo,
    });

    console.log(`Created module: ${createdModule.title}`);

    // Create lessons for this module
    for (const lessonData of lessons) {
      const existingLesson = await prisma.lesson.findFirst({
        where: {
          title: lessonData.title,
          moduleId: createdModule.id,
        },
      });

      if (existingLesson) {
        console.log(`Lesson already exists: ${lessonData.title}`);
        continue;
      }

      const createdLesson = await prisma.lesson.create({
        data: {
          ...lessonData,
          moduleId: createdModule.id,
        },
      });

      console.log(`Created lesson: ${createdLesson.title}`);
    }
  }

  console.log("Course content seeding completed!");
}

seedCourseContent()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
