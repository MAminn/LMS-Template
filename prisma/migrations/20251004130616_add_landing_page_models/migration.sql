-- CreateTable
CREATE TABLE "landing_page_content" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "heroTitle" TEXT NOT NULL DEFAULT 'Build Your Learning Empire',
    "heroSubtitle" TEXT NOT NULL DEFAULT 'Complete Learning Management System with no-code customization, advanced analytics, and seamless content delivery.',
    "heroBadgeText" TEXT NOT NULL DEFAULT '🚀 Next-Generation Learning Platform',
    "heroCtaPrimary" TEXT NOT NULL DEFAULT 'Explore Courses',
    "heroCtaSecondary" TEXT NOT NULL DEFAULT 'Start Learning',
    "studentsCount" TEXT NOT NULL DEFAULT '1000+',
    "coursesCount" TEXT NOT NULL DEFAULT '50+',
    "instructorsCount" TEXT NOT NULL DEFAULT '25+',
    "completionRate" TEXT NOT NULL DEFAULT '95%',
    "featuresTitle" TEXT NOT NULL DEFAULT 'Everything You Need to Succeed',
    "featuresSubtitle" TEXT NOT NULL DEFAULT 'From course creation to student management, we provide all the tools you need to build and scale your educational platform.',
    "demoTitle" TEXT NOT NULL DEFAULT 'Try The Academy Today',
    "demoSubtitle" TEXT NOT NULL DEFAULT 'Experience the full power of our learning management system with these demo accounts.',
    "footerDescription" TEXT NOT NULL DEFAULT 'Empowering educators and learners with cutting-edge technology. Build, customize, and scale your learning platform with ease.',
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "landing_page_content_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "landing_page_features" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT 'blue',
    "features" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "contentId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
