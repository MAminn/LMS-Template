# Prisma Database Setup

This document explains how to set up the database and generate the Prisma client for The Academy LMS.

## Prerequisites

1. Make sure you have a database URL configured in your `.env` file:
   ```
   DATABASE_URL="file:./dev.db"
   ```

## Setup Steps

1. **Generate Prisma Client**

   ```bash
   npx prisma generate
   ```

2. **Run Database Migrations**

   ```bash
   npx prisma db push
   ```

3. **View Database (Optional)**
   ```bash
   npx prisma studio
   ```

## Repository Implementation Status

✅ **CourseRepository** - Fully implemented with Prisma

- Find by ID, instructor, published courses
- Search functionality with filters
- CRUD operations (create, update, delete)
- Publish/unpublish courses
- Statistics and access control
- Featured, trending, and related courses

✅ **UserRepository** - Implemented with Prisma

- Find by ID, email, role
- CRUD operations
- Profile management
- Search functionality
- Statistics and verification

✅ **ContentRepository (Module/Lesson)** - Implemented with Prisma

- Module management with lessons
- CRUD operations for both modules and lessons
- Ordering and statistics

✅ **ProgressRepository** - Implemented with Prisma

- Course and lesson progress tracking
- User progress across all courses
- Statistics and analytics

## Service Layer Integration

All services are configured to work with the Prisma repositories:

```typescript
import { getServices } from "@/infrastructure/services/ServiceFactory";

const { courseService, userService, contentService, progressService } =
  getServices();
```

## Database Schema Features

- **Users**: Authentication, roles (STUDENT, INSTRUCTOR, ADMIN)
- **Courses**: Title, description, pricing, publishing status
- **Modules & Lessons**: Hierarchical content structure
- **Progress Tracking**: Enrollment and lesson completion
- **Session Management**: NextAuth.js integration

## TODO: Schema Enhancements

The following fields need to be added to the Prisma schema for full feature support:

### User Model

- `avatar: String?`
- `emailVerified: Boolean @default(false)`
- `lastLoginAt: DateTime?`
- `bio: String?`
- `website: String?`

### Course Model

- `category: String?`
- `level: CourseLevel @default(ALL_LEVELS)`
- `language: String @default("en")`
- `tags: String[]`
- `requirements: String[]`
- `learningObjectives: String[]`

### Lesson Model

- `type: LessonType @default(VIDEO)`
- `isPreview: Boolean @default(false)`
- `isFree: Boolean @default(false)`

### New Models Needed

- `CourseReview` for ratings and reviews
- `Certificate` for course completion certificates
- `LessonWatchTime` for detailed progress tracking

## Example Usage

```typescript
// Get a course with full details
const course = await courseService.getCourse("course-id", "user-id");

// Enroll a user in a course
const progress = await progressService.startCourse("course-id", "user-id");

// Complete a lesson
await progressService.completeLesson("lesson-id", "user-id", 300);

// Create a new course
const newCourse = await courseService.createCourse(
  {
    title: "New Course",
    description: "Course description",
    price: 99.99,
    category: "Programming",
    level: "BEGINNER",
  },
  "instructor-id"
);
```
