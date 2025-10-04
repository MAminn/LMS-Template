import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type {
  Course,
  CreateCourseData,
  UpdateCourseData,
  CourseFilters,
} from "@/domains/courses/types";
import type { CourseRepository } from "@/domains/courses/repository";
import type { PaginationParams } from "@/shared/types/global";

// Define the type for Course with includes
type CourseWithIncludes = Prisma.CourseGetPayload<{
  include: {
    instructor: {
      select: {
        id: true;
        name: true;
        email: true;
      };
    };
    enrollments: {
      select: {
        id: true;
        studentId: true;
        progress: true;
      };
    };
  };
}>;

export class PrismaCourseRepository implements CourseRepository {
  /**
   * Find a course by its ID
   */
  async findById(id: string): Promise<Course | null> {
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        enrollments: {
          select: {
            id: true,
            studentId: true,
            progress: true,
          },
        },
      },
    });

    if (!course) return null;
    return this.mapPrismaCourseToEntity(course);
  }

  /**
   * Find courses by instructor
   */
  async findByInstructor(
    instructorId: string,
    pagination?: PaginationParams
  ): Promise<readonly Course[]> {
    const { page = 1, limit = 10 } = pagination || {};
    const skip = (page - 1) * limit;

    const courses = await prisma.course.findMany({
      where: { instructorId },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        enrollments: {
          select: {
            id: true,
            studentId: true,
            progress: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    });

    return courses.map((course) => this.mapPrismaCourseToEntity(course));
  }

  /**
   * Find published courses with filters
   */
  async findPublished(
    filters?: CourseFilters,
    pagination?: PaginationParams
  ): Promise<{
    readonly courses: readonly Course[];
    readonly total: number;
  }> {
    const { page = 1, limit = 10 } = pagination || {};
    const skip = (page - 1) * limit;

    const where: Prisma.CourseWhereInput = {
      isPublished: true,
      AND: [
        // Category filter
        filters?.category
          ? {
              // Note: We'll need to add category field to schema
              // For now, skip this filter
            }
          : {},
        // Price filter
        filters?.price === "free"
          ? { price: 0 }
          : filters?.price === "paid"
          ? { price: { gt: 0 } }
          : {},
        // Instructor filter
        filters?.instructor
          ? {
              instructor: {
                name: { contains: filters.instructor },
              },
            }
          : {},
      ],
    };

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        include: {
          instructor: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          enrollments: {
            select: {
              id: true,
              studentId: true,
              progress: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.course.count({ where }),
    ]);

    return {
      courses: courses.map((course) => this.mapPrismaCourseToEntity(course)),
      total,
    };
  }

  /**
   * Search courses by text query
   */
  async search(
    query: string,
    filters?: CourseFilters,
    pagination?: PaginationParams
  ): Promise<{
    readonly courses: readonly Course[];
    readonly total: number;
  }> {
    const { page = 1, limit = 10 } = pagination || {};
    const skip = (page - 1) * limit;

    const where: Prisma.CourseWhereInput = {
      AND: [
        // Text search
        {
          OR: [
            { title: { contains: query } },
            { description: { contains: query } },
          ],
        },
        // Apply filters from findPublished
        filters?.category ? {} : {},
        filters?.price === "free"
          ? { price: 0 }
          : filters?.price === "paid"
          ? { price: { gt: 0 } }
          : {},
        filters?.instructor
          ? {
              instructor: {
                name: { contains: filters.instructor },
              },
            }
          : {},
      ],
    };

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        include: {
          instructor: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          enrollments: {
            select: {
              id: true,
              studentId: true,
              progress: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.course.count({ where }),
    ]);

    return {
      courses: courses.map((course) => this.mapPrismaCourseToEntity(course)),
      total,
    };
  }

  /**
   * Create new course
   */
  async create(data: CreateCourseData, instructorId: string): Promise<Course> {
    const course = await prisma.course.create({
      data: {
        title: data.title,
        description: data.description,
        price: data.price || 0,
        instructorId,
        isPublished: false,
        // Note: We'll need to add these fields to the schema later
        // category: data.category,
        // level: data.level,
        // language: data.language || 'en',
      },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        enrollments: {
          select: {
            id: true,
            studentId: true,
            progress: true,
          },
        },
      },
    });

    return this.mapPrismaCourseToEntity(course);
  }

  /**
   * Update existing course
   */
  async update(id: string, data: UpdateCourseData): Promise<Course> {
    const updateData: Prisma.CourseUpdateInput = {};

    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.thumbnail !== undefined) updateData.thumbnail = data.thumbnail;
    if (data.price !== undefined) updateData.price = data.price;

    const course = await prisma.course.update({
      where: { id },
      data: updateData,
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        enrollments: {
          select: {
            id: true,
            studentId: true,
            progress: true,
          },
        },
      },
    });

    return this.mapPrismaCourseToEntity(course);
  }

  /**
   * Delete course
   */
  async delete(id: string): Promise<void> {
    await prisma.course.delete({
      where: { id },
    });
  }

  /**
   * Publish course
   */
  async publish(id: string): Promise<Course> {
    const course = await prisma.course.update({
      where: { id },
      data: { isPublished: true },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        enrollments: {
          select: {
            id: true,
            studentId: true,
            progress: true,
          },
        },
      },
    });

    return this.mapPrismaCourseToEntity(course);
  }

  /**
   * Unpublish course
   */
  async unpublish(id: string): Promise<Course> {
    const course = await prisma.course.update({
      where: { id },
      data: { isPublished: false },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        enrollments: {
          select: {
            id: true,
            studentId: true,
            progress: true,
          },
        },
      },
    });

    return this.mapPrismaCourseToEntity(course);
  }

  /**
   * Get course statistics
   */
  async getStats(id: string): Promise<{
    readonly studentsCount: number;
    readonly completionRate: number;
    readonly averageRating: number;
    readonly totalRevenue: number;
  }> {
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        enrollments: true,
      },
    });

    if (!course) {
      return {
        studentsCount: 0,
        completionRate: 0,
        averageRating: 0,
        totalRevenue: 0,
      };
    }

    const studentsCount = course.enrollments.length;
    const totalRevenue = studentsCount * (course.price || 0);

    // Calculate completion rate based on enrollments with 100% progress
    const completedEnrollments = course.enrollments.filter(
      (e) => e.progress >= 100
    );
    const completionRate =
      studentsCount > 0
        ? (completedEnrollments.length / studentsCount) * 100
        : 0;

    return {
      studentsCount,
      completionRate,
      averageRating: 0, // Will implement when we add reviews
      totalRevenue,
    };
  }

  /**
   * Check if user can access course
   */
  async canAccess(courseId: string, userId: string): Promise<boolean> {
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: userId,
          courseId,
        },
      },
    });

    return !!enrollment;
  }

  /**
   * Get featured courses
   */
  async getFeatured(limit?: number): Promise<readonly Course[]> {
    const courses = await prisma.course.findMany({
      where: { isPublished: true },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        enrollments: {
          select: {
            id: true,
            studentId: true,
            progress: true,
          },
        },
      },
      take: limit || 10,
      orderBy: {
        enrollments: {
          _count: "desc",
        },
      },
    });

    return courses.map((course) => this.mapPrismaCourseToEntity(course));
  }

  /**
   * Get trending courses
   */
  async getTrending(limit?: number): Promise<readonly Course[]> {
    // For now, return courses ordered by recent enrollments
    // This would need more sophisticated logic in a real app
    const courses = await prisma.course.findMany({
      where: { isPublished: true },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        enrollments: {
          select: {
            id: true,
            studentId: true,
            progress: true,
          },
        },
      },
      take: limit || 10,
      orderBy: { createdAt: "desc" },
    });

    return courses.map((course) => this.mapPrismaCourseToEntity(course));
  }

  /**
   * Get related courses
   */
  async getRelated(
    courseId: string,
    limit?: number
  ): Promise<readonly Course[]> {
    const targetCourse = await prisma.course.findUnique({
      where: { id: courseId },
      select: { instructorId: true },
    });

    if (!targetCourse) return [];

    const courses = await prisma.course.findMany({
      where: {
        isPublished: true,
        instructorId: targetCourse.instructorId,
        id: { not: courseId },
      },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        enrollments: {
          select: {
            id: true,
            studentId: true,
            progress: true,
          },
        },
      },
      take: limit || 5,
      orderBy: { createdAt: "desc" },
    });

    return courses.map((course) => this.mapPrismaCourseToEntity(course));
  }

  /**
   * Map Prisma course to domain entity
   * Note: This is a simplified mapping. We'll need to enhance the schema
   * to fully support all domain properties
   */
  private mapPrismaCourseToEntity(prismaCourse: CourseWithIncludes): Course {
    return {
      id: prismaCourse.id,
      title: prismaCourse.title,
      description: prismaCourse.description || "",
      ...(prismaCourse.thumbnail && { thumbnail: prismaCourse.thumbnail }),
      price: prismaCourse.price || 0,
      status: prismaCourse.isPublished ? "PUBLISHED" : "DRAFT",
      instructorId: prismaCourse.instructorId,
      instructor: {
        id: prismaCourse.instructor.id,
        name: prismaCourse.instructor.name || "",
        email: prismaCourse.instructor.email,
        avatar: "", // Will be added when we enhance the User model
      },
      category: "General", // Will be added to schema
      level: "ALL_LEVELS", // Will be added to schema
      duration: 0, // Will be calculated from lessons
      language: "en", // Will be added to schema
      tags: [], // Will be added to schema
      requirements: [], // Will be added to schema
      learningObjectives: [], // Will be added to schema
      studentsCount: prismaCourse.enrollments?.length || 0,
      rating: 0, // Will be calculated from reviews
      reviewsCount: 0, // Will be calculated from reviews
      isPublished: prismaCourse.isPublished,
      ...(prismaCourse.isPublished &&
        prismaCourse.createdAt && { publishedAt: prismaCourse.createdAt }),
      createdAt: prismaCourse.createdAt,
      updatedAt: prismaCourse.createdAt, // Will be added to schema
    };
  }
}
