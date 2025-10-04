import { PrismaClient } from "@prisma/client";

async function testCourseWithAPI() {
  const prisma = new PrismaClient();

  console.log("🔍 TESTING COURSE API RESPONSE");
  console.log("=".repeat(50));

  try {
    // Test with the course ID from the error message
    const testCourseId = "cmg7mdlxy0003uu8ks480zimr";

    console.log(`\nTesting Course ID: ${testCourseId}`);

    // Check if this course exists in database
    const course = await prisma.course.findUnique({
      where: { id: testCourseId },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!course) {
      console.log("❌ Course not found in database");

      // Get a valid course ID instead
      const validCourse = await prisma.course.findFirst({
        include: {
          instructor: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (validCourse) {
        console.log(`\n✅ Found valid course: ${validCourse.id}`);
        console.log(`   Title: ${validCourse.title}`);
        console.log(
          `   Instructor: ${
            validCourse.instructor?.name || "No instructor data"
          }`
        );
        console.log(`   Published: ${validCourse.isPublished}`);

        console.log(
          `\n🌐 Test this URL: http://localhost:3000/courses/${validCourse.id}/learn`
        );
      }
    } else {
      console.log("✅ Course found in database");
      console.log(`   Title: ${course.title}`);
      console.log(
        `   Instructor: ${course.instructor?.name || "No instructor data"}`
      );
      console.log(`   Published: ${course.isPublished}`);

      console.log(
        `\n🌐 Test this URL: http://localhost:3000/courses/${course.id}/learn`
      );
    }
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testCourseWithAPI();
