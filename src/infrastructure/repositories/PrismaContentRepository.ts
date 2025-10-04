import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type {
  Module,
  Lesson,
  CreateModuleData,
  UpdateModuleData,
  CreateLessonData,
  UpdateLessonData,
  ModuleWithLessons,
} from "@/domains/content/types";
import type {
  ModuleRepository,
  LessonRepository,
} from "@/domains/content/repository";
import type { PaginationParams } from "@/shared/types/global";

/**
 * Prisma implementation of ModuleRepository
 */
export class PrismaModuleRepository implements ModuleRepository {
  /**
   * Find module by ID
   */
  async findById(id: string): Promise<Module | null> {
    const moduleData = await prisma.module.findUnique({
      where: { id },
      include: {
        lessons: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!moduleData) return null;

    return this.mapPrismaModuleToEntity(moduleData);
  }

  /**
   * Find modules by course ID
   */
  async findByCourseId(
    courseId: string,
    pagination?: PaginationParams
  ): Promise<readonly Module[]> {
    const {
      page = 1,
      limit = 50,
      sortBy = "order",
      sortOrder = "asc",
    } = pagination || {};
    const skip = (page - 1) * limit;

    const modules = await prisma.module.findMany({
      where: { courseId },
      include: {
        lessons: {
          orderBy: { order: "asc" },
        },
      },
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
    });

    return modules.map((moduleData) =>
      this.mapPrismaModuleToEntity(moduleData)
    );
  }

  /**
   * Find module with lessons
   */
  async findByIdWithLessons(id: string): Promise<ModuleWithLessons | null> {
    const moduleData = await prisma.module.findUnique({
      where: { id },
      include: {
        lessons: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!moduleData) return null;

    return this.mapPrismaModuleToEntityWithLessons(moduleData);
  }

  /**
   * Create new module
   */
  async create(data: CreateModuleData): Promise<Module> {
    const moduleData = await prisma.module.create({
      data: {
        title: data.title,
        description: data.description || null,
        order: data.order,
        courseId: data.courseId,
      },
      include: {
        lessons: {
          orderBy: { order: "asc" },
        },
      },
    });

    return this.mapPrismaModuleToEntity(moduleData);
  }

  /**
   * Update existing module
   */
  async update(id: string, data: UpdateModuleData): Promise<Module> {
    const moduleData = await prisma.module.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
        ...(data.order !== undefined && { order: data.order }),
      },
      include: {
        lessons: {
          orderBy: { order: "asc" },
        },
      },
    });

    return this.mapPrismaModuleToEntity(moduleData);
  }

  /**
   * Delete module
   */
  async delete(id: string): Promise<void> {
    await prisma.module.delete({
      where: { id },
    });
  }

  /**
   * Reorder modules in course
   */
  async reorderModules(
    courseId: string,
    moduleIds: readonly string[]
  ): Promise<void> {
    await prisma.$transaction(
      moduleIds.map((moduleId, index) =>
        prisma.module.update({
          where: { id: moduleId, courseId },
          data: { order: index + 1 },
        })
      )
    );
  }

  /**
   * Map Prisma module to domain entity
   */
  private mapPrismaModuleToEntity(prismaModule: any): Module {
    const totalDuration =
      prismaModule.lessons?.reduce(
        (total: number, lesson: any) => total + (lesson.duration || 0),
        0
      ) || 0;

    return {
      id: prismaModule.id,
      title: prismaModule.title,
      description: prismaModule.description,
      order: prismaModule.order,
      courseId: prismaModule.courseId,
      lessons: [],
      duration: totalDuration,
      lessonsCount: prismaModule.lessons?.length || 0,
      createdAt: prismaModule.createdAt,
      updatedAt: prismaModule.createdAt,
    };
  }

  /**
   * Map Prisma module to domain entity with lessons
   */
  private mapPrismaModuleToEntityWithLessons(
    prismaModule: any
  ): ModuleWithLessons {
    const lessons =
      prismaModule.lessons?.map((lesson: any) => ({
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        content: lesson.content,
        type: "VIDEO" as const, // TODO: Add type to schema
        order: lesson.order,
        moduleId: lesson.moduleId,
        duration: lesson.duration,
        videoUrl: lesson.videoUrl,
        attachments: [],
        isPreview: false,
        isFree: false,
        createdAt: lesson.createdAt,
        updatedAt: lesson.createdAt,
      })) || [];

    const totalDuration = lessons.reduce(
      (total: number, lesson: { duration?: number }) =>
        total + (lesson.duration || 0),
      0
    );

    return {
      id: prismaModule.id,
      title: prismaModule.title,
      description: prismaModule.description,
      order: prismaModule.order,
      courseId: prismaModule.courseId,
      lessons,
      duration: totalDuration,
      lessonsCount: lessons.length,
      createdAt: prismaModule.createdAt,
      updatedAt: prismaModule.createdAt,
    };
  }
}

/**
 * Prisma implementation of LessonRepository
 */
export class PrismaLessonRepository implements LessonRepository {
  /**
   * Find lesson by ID
   */
  async findById(id: string): Promise<Lesson | null> {
    const lesson = await prisma.lesson.findUnique({
      where: { id },
    });

    if (!lesson) return null;

    return this.mapPrismaLessonToEntity(lesson);
  }

  /**
   * Find lessons by module ID
   */
  async findByModuleId(
    moduleId: string,
    pagination?: PaginationParams
  ): Promise<readonly Lesson[]> {
    const {
      page = 1,
      limit = 50,
      sortBy = "order",
      sortOrder = "asc",
    } = pagination || {};
    const skip = (page - 1) * limit;

    const lessons = await prisma.lesson.findMany({
      where: { moduleId },
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
    });

    return lessons.map((lesson) => this.mapPrismaLessonToEntity(lesson));
  }

  /**
   * Create new lesson
   */
  async create(data: CreateLessonData): Promise<Lesson> {
    const lesson = await prisma.lesson.create({
      data: {
        title: data.title,
        description: data.description || null,
        content: data.content || null,
        videoUrl: data.videoUrl || null,
        duration: data.duration || null,
        order: data.order,
        moduleId: data.moduleId,
      },
    });

    return this.mapPrismaLessonToEntity(lesson);
  }

  /**
   * Update existing lesson
   */
  async update(id: string, data: UpdateLessonData): Promise<Lesson> {
    const lesson = await prisma.lesson.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
        ...(data.content !== undefined && { content: data.content }),
        ...(data.videoUrl !== undefined && { videoUrl: data.videoUrl }),
        ...(data.duration !== undefined && { duration: data.duration }),
        ...(data.order !== undefined && { order: data.order }),
      },
    });

    return this.mapPrismaLessonToEntity(lesson);
  }

  /**
   * Delete lesson
   */
  async delete(id: string): Promise<void> {
    await prisma.lesson.delete({
      where: { id },
    });
  }

  /**
   * Reorder lessons in module
   */
  async reorderLessons(
    moduleId: string,
    lessonIds: readonly string[]
  ): Promise<void> {
    await prisma.$transaction(
      lessonIds.map((lessonId, index) =>
        prisma.lesson.update({
          where: { id: lessonId, moduleId },
          data: { order: index + 1 },
        })
      )
    );
  }

  /**
   * Get lesson statistics
   */
  async getLessonStats(lessonId: string): Promise<{
    readonly viewCount: number;
    readonly completionRate: number;
    readonly averageWatchTime: number;
  }> {
    const progressRecords = await prisma.lessonProgress.findMany({
      where: { lessonId },
      select: { completed: true },
    });

    const viewCount = progressRecords.length;
    const completedCount = progressRecords.filter((p) => p.completed).length;
    const completionRate =
      viewCount > 0 ? (completedCount / viewCount) * 100 : 0;

    return {
      viewCount,
      completionRate,
      averageWatchTime: 0, // TODO: Add watch time tracking
    };
  }

  /**
   * Map Prisma lesson to domain entity
   */
  private mapPrismaLessonToEntity(prismaLesson: any): Lesson {
    return {
      id: prismaLesson.id,
      title: prismaLesson.title,
      description: prismaLesson.description,
      content: prismaLesson.content,
      type: "VIDEO", // TODO: Add type to schema
      order: prismaLesson.order,
      moduleId: prismaLesson.moduleId,
      duration: prismaLesson.duration,
      videoUrl: prismaLesson.videoUrl,
      attachments: [],
      isPreview: false,
      isFree: false,
      createdAt: prismaLesson.createdAt,
      updatedAt: prismaLesson.createdAt,
    };
  }
}
