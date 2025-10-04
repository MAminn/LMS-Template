import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type {
  User,
  CreateUserData,
  UpdateUserData,
  UserProfile,
} from "@/domains/users/types";
import type { UserRepository } from "@/domains/users/repository";
import type { PaginationParams, UserRole } from "@/shared/types/global";

type UserWithIncludes = Prisma.UserGetPayload<{
  include: {
    enrollments: {
      include: {
        course: {
          select: {
            id: true;
            title: true;
            thumbnail: true;
          };
        };
      };
    };
    instructedCourses: {
      select: {
        id: true;
        title: true;
        studentsCount: true;
      };
    };
  };
}>;

/**
 * Prisma implementation of UserRepository
 */
export class PrismaUserRepository implements UserRepository {
  /**
   * Find user by ID
   */
  async findById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) return null;

    return this.mapPrismaUserToEntity(user);
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) return null;

    return this.mapPrismaUserToEntity(user);
  }

  /**
   * Find users by role
   */
  async findByRole(
    role: UserRole,
    pagination?: PaginationParams
  ): Promise<readonly User[]> {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = pagination || {};
    const skip = (page - 1) * limit;

    const users = await prisma.user.findMany({
      where: { role },
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
    });

    return users.map((user) => this.mapPrismaUserToEntity(user));
  }

  /**
   * Create new user
   */
  async create(data: CreateUserData): Promise<User> {
    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: data.password,
        role: data.role || "STUDENT",
      },
    });

    return this.mapPrismaUserToEntity(user);
  }

  /**
   * Update existing user
   */
  async update(id: string, data: UpdateUserData): Promise<User> {
    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        // Note: preferences would need to be added to schema
      },
    });

    return this.mapPrismaUserToEntity(user);
  }

  /**
   * Delete user
   */
  async delete(id: string): Promise<void> {
    await prisma.user.delete({
      where: { id },
    });
  }

  /**
   * Get user profile
   */
  async getProfile(id: string): Promise<UserProfile | null> {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        enrollments: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                thumbnail: true,
              },
            },
          },
        },
        instructedCourses: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    if (!user) return null;

    // Count students for instructor
    let studentsCount = 0;
    if (user.role === "INSTRUCTOR") {
      const enrollments = await prisma.enrollment.findMany({
        where: {
          course: {
            instructorId: id,
          },
        },
        distinct: ["studentId"],
      });
      studentsCount = enrollments.length;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name || "",
      role: user.role,
      avatar: undefined, // TODO: Add avatar to schema
      isEmailVerified: false, // TODO: Add email verification to schema
      lastLoginAt: undefined, // TODO: Add last login tracking
      bio: undefined, // TODO: Add bio to schema
      website: undefined, // TODO: Add website to schema
      socialLinks: {
        twitter: undefined,
        linkedin: undefined,
        github: undefined,
        website: undefined,
      },
      expertise: [], // TODO: Add expertise to schema
      coursesCreated: user.instructedCourses?.length || 0,
      studentsCount,
      createdAt: user.createdAt,
      updatedAt: user.createdAt,
    };
  }

  /**
   * Update user profile
   */
  async updateProfile(
    id: string,
    data: Partial<UserProfile>
  ): Promise<UserProfile> {
    // Update basic user info
    await prisma.user.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        // TODO: Add other profile fields to schema
      },
    });

    const profile = await this.getProfile(id);
    if (!profile) {
      throw new Error("User profile not found");
    }

    return profile;
  }

  /**
   * Verify user email
   */
  async verifyEmail(id: string): Promise<User> {
    // TODO: Add email verification field to schema
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return this.mapPrismaUserToEntity(user);
  }

  /**
   * Update last login timestamp
   */
  async updateLastLogin(id: string): Promise<void> {
    // TODO: Add lastLoginAt field to schema
    // await prisma.user.update({
    //   where: { id },
    //   data: { lastLoginAt: new Date() },
    // });
  }

  /**
   * Search users by name or email
   */
  async search(
    query: string,
    pagination?: PaginationParams
  ): Promise<{
    readonly users: readonly User[];
    readonly total: number;
  }> {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = pagination || {};
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
      ],
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users: users.map((user) => this.mapPrismaUserToEntity(user)),
      total,
    };
  }

  /**
   * Check if email exists
   */
  async emailExists(email: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    return !!user;
  }

  /**
   * Get user statistics
   */
  async getStats(id: string): Promise<{
    readonly coursesCreated?: number;
    readonly studentsCount?: number;
    readonly coursesEnrolled?: number;
    readonly coursesCompleted?: number;
  }> {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { role: true },
    });

    if (!user) {
      throw new Error("User not found");
    }

    if (user.role === "INSTRUCTOR") {
      // Get instructor stats
      const [courses, enrollments] = await Promise.all([
        prisma.course.findMany({
          where: { instructorId: id },
          select: { id: true },
        }),
        prisma.enrollment.findMany({
          where: {
            course: {
              instructorId: id,
            },
          },
          distinct: ["studentId"],
        }),
      ]);

      return {
        coursesCreated: courses.length,
        studentsCount: enrollments.length,
      };
    } else {
      // Get student stats
      const enrollments = await prisma.enrollment.findMany({
        where: { studentId: id },
        select: { progress: true },
      });

      const coursesCompleted = enrollments.filter(
        (e) => e.progress >= 100
      ).length;

      return {
        coursesEnrolled: enrollments.length,
        coursesCompleted,
      };
    }
  }

  /**
   * Map Prisma user to domain entity
   */
  private mapPrismaUserToEntity(prismaUser: Prisma.UserGetPayload<{}>): User {
    return {
      id: prismaUser.id,
      email: prismaUser.email,
      name: prismaUser.name || "",
      role: prismaUser.role,
      avatar: undefined, // TODO: Add avatar to schema
      isEmailVerified: false, // TODO: Add email verification to schema
      lastLoginAt: undefined, // TODO: Add last login tracking
      preferences: {
        theme: "system",
        language: "en",
        timezone: "UTC",
        emailNotifications: true,
        marketingEmails: false,
      },
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.createdAt,
    };
  }
}
