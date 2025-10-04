import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testAuth() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: "admin@theacademy.com" },
    });

    if (!user) {
      console.log("User not found");
      return;
    }

    console.log("User found:", user.email);

    const testPassword = "admin123";
    const isValid = await bcrypt.compare(testPassword, user.password!);

    console.log("Password test:", isValid ? "VALID" : "INVALID");
    console.log("Stored hash:", user.password);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testAuth();
