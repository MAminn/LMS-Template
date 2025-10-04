import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create admin user for testing
  const hashedPassword = await bcrypt.hash("admin123", 12);

  const admin = await prisma.user.create({
    data: {
      email: "admin@academy.com",
      name: "Admin User",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log("Created admin user:", admin);

  // Create test student
  const studentPassword = await bcrypt.hash("student123", 12);

  const student = await prisma.user.create({
    data: {
      email: "student@academy.com",
      name: "Test Student",
      password: studentPassword,
      role: "STUDENT",
    },
  });

  console.log("Created student user:", student);

  // Create test instructor
  const instructorPassword = await bcrypt.hash("instructor123", 12);

  const instructor = await prisma.user.create({
    data: {
      email: "instructor@academy.com",
      name: "Test Instructor",
      password: instructorPassword,
      role: "INSTRUCTOR",
    },
  });

  console.log("Created instructor user:", instructor);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
