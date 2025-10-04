import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function checkUser() {
  try {
    const users = await prisma.user.findMany();
    console.log("All users in database:");
    users.forEach((user) => {
      console.log(`- ID: ${user.id}, Email: ${user.email}, Role: ${user.role}`);
    });

    const adminUser = await prisma.user.findUnique({
      where: { email: "admin@theacademy.com" },
    });

    if (adminUser) {
      console.log("\nAdmin user found:", {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role,
        hasPassword: !!adminUser.password,
      });
    } else {
      console.log("\nNo admin user found!");
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();
