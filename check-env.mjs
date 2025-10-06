// Check environment variables
console.log("DATABASE_URL:", process.env.DATABASE_URL);
console.log("Current working directory:", process.cwd());
console.log("File exists checks:");

import { existsSync } from "fs";
import { resolve } from "path";

const dbPaths = [
  "./prisma/dev.db",
  "file:./prisma/dev.db",
  resolve("./prisma/dev.db"),
  resolve("./prisma/prisma/dev.db"),
];

dbPaths.forEach((path) => {
  console.log(`${path}: ${existsSync(path.replace("file:", ""))}`);
});
