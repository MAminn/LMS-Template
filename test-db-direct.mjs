// Direct test of database connection
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

async function testDatabase() {
  try {
    console.log("Testing database connection...");

    // Try to query landing page content
    console.log("Attempting to query landing page content...");
    const content = await prisma.landingPageContent.findFirst();
    console.log("Query successful:", content);
  } catch (error) {
    console.error("Database error:", error);

    // Try to see what tables exist
    console.log("Checking database structure...");
    try {
      const result =
        await prisma.$queryRaw`SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;`;
      console.log("Tables in database:", result);
    } catch (structureError) {
      console.error("Could not check structure:", structureError);
    }
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();
