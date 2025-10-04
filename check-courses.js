import { PrismaClient } from "@prisma/client";

async function main() {
  const prisma = new PrismaClient();

  try {
    const courses = await prisma.course.findMany({
      include: {
        instructor: true,
        modules: {
          include: {
            lessons: true,
          },
        },
      },
    });

    console.log("Available Courses:");
    courses.forEach((course) => {
      console.log(`- ID: ${course.id}`);
      console.log(`  Title: ${course.title}`);
      console.log(`  Instructor: ${course.instructor.name}`);
      console.log(`  Modules: ${course.modules.length}`);
      console.log(`  Published: ${course.isPublished}`);
      console.log("");
    });
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
