import type {
  Module,
  Lesson,
  CreateModuleData,
  UpdateModuleData,
  CreateLessonData,
  UpdateLessonData,
  ModuleWithLessons,
} from "./types";
import type { ModuleRepository, LessonRepository } from "./repository";
import type { UserRepository } from "@/domains/users/repository";
import type { PaginationParams } from "@/shared/types/global";
import {
  NotFoundError,
  AuthorizationError,
  ValidationError,
} from "@/shared/errors/AppError";

/**
 * Content service - handles business logic for modules and lessons
 */
export class ContentService {
  constructor(
    private readonly moduleRepo: ModuleRepository,
    private readonly lessonRepo: LessonRepository,
    private readonly userRepo: UserRepository
  ) {}

  /**
   * Get module by ID with lessons
   */
  async getModule(id: string, userId?: string): Promise<ModuleWithLessons> {
    const moduleData = await this.moduleRepo.findByIdWithLessons(id);
    if (!moduleData) {
      throw new NotFoundError("Module not found");
    }

    // Filter lessons based on user permissions
    if (userId) {
      const user = await this.userRepo.findById(userId);
      if (user?.role === "ADMIN" || user?.role === "INSTRUCTOR") {
        return moduleData;
      }
    }

    // For students, only show preview lessons and free lessons
    const filteredLessons = moduleData.lessons.filter(
      (lesson: Lesson) => lesson.isPreview || lesson.isFree
    );

    return {
      ...moduleData,
      lessons: filteredLessons,
    };
  }

  /**
   * Get modules by course ID
   */
  async getModulesByCourse(
    courseId: string,
    pagination?: PaginationParams
  ): Promise<readonly Module[]> {
    return await this.moduleRepo.findByCourseId(courseId, pagination);
  }

  /**
   * Create new module
   */
  async createModule(data: CreateModuleData, userId: string): Promise<Module> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new AuthorizationError("User not found");
    }

    // Only instructors and admins can create modules
    if (user.role !== "INSTRUCTOR" && user.role !== "ADMIN") {
      throw new AuthorizationError(
        "Only instructors and admins can create modules"
      );
    }

    // Validate module data
    this.validateModuleData(data);

    return await this.moduleRepo.create(data);
  }

  /**
   * Update module
   */
  async updateModule(
    id: string,
    data: UpdateModuleData,
    userId: string
  ): Promise<Module> {
    const moduleData = await this.moduleRepo.findById(id);
    if (!moduleData) {
      throw new NotFoundError("Module not found");
    }

    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new AuthorizationError("User not found");
    }

    // Only instructors and admins can update modules
    if (user.role !== "INSTRUCTOR" && user.role !== "ADMIN") {
      throw new AuthorizationError(
        "Only instructors and admins can update modules"
      );
    }

    // Validate update data
    if (data.title) {
      this.validateModuleData({
        title: data.title,
        courseId: moduleData.courseId,
        order: data.order || moduleData.order,
      });
    }

    return await this.moduleRepo.update(id, data);
  }

  /**
   * Delete module
   */
  async deleteModule(id: string, userId: string): Promise<void> {
    const moduleData = await this.moduleRepo.findById(id);
    if (!moduleData) {
      throw new NotFoundError("Module not found");
    }

    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new AuthorizationError("User not found");
    }

    // Only instructors and admins can delete modules
    if (user.role !== "INSTRUCTOR" && user.role !== "ADMIN") {
      throw new AuthorizationError(
        "Only instructors and admins can delete modules"
      );
    }

    await this.moduleRepo.delete(id);
  }

  /**
   * Get lesson by ID
   */
  async getLesson(id: string, userId?: string): Promise<Lesson> {
    const lesson = await this.lessonRepo.findById(id);
    if (!lesson) {
      throw new NotFoundError("Lesson not found");
    }

    // Check access permissions
    if (userId) {
      const user = await this.userRepo.findById(userId);
      if (user?.role === "ADMIN" || user?.role === "INSTRUCTOR") {
        return lesson;
      }

      // For students, check if lesson is accessible
      if (!lesson.isPreview && !lesson.isFree) {
        // TODO: Check if user has access to the course
        // This would require checking course enrollment
      }
    } else {
      // For non-authenticated users, only show preview lessons
      if (!lesson.isPreview) {
        throw new AuthorizationError("Access denied to this lesson");
      }
    }

    return lesson;
  }

  /**
   * Create new lesson
   */
  async createLesson(data: CreateLessonData, userId: string): Promise<Lesson> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new AuthorizationError("User not found");
    }

    // Only instructors and admins can create lessons
    if (user.role !== "INSTRUCTOR" && user.role !== "ADMIN") {
      throw new AuthorizationError(
        "Only instructors and admins can create lessons"
      );
    }

    // Validate lesson data
    this.validateLessonData(data);

    return await this.lessonRepo.create(data);
  }

  /**
   * Update lesson
   */
  async updateLesson(
    id: string,
    data: UpdateLessonData,
    userId: string
  ): Promise<Lesson> {
    const lesson = await this.lessonRepo.findById(id);
    if (!lesson) {
      throw new NotFoundError("Lesson not found");
    }

    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new AuthorizationError("User not found");
    }

    // Only instructors and admins can update lessons
    if (user.role !== "INSTRUCTOR" && user.role !== "ADMIN") {
      throw new AuthorizationError(
        "Only instructors and admins can update lessons"
      );
    }

    return await this.lessonRepo.update(id, data);
  }

  /**
   * Delete lesson
   */
  async deleteLesson(id: string, userId: string): Promise<void> {
    const lesson = await this.lessonRepo.findById(id);
    if (!lesson) {
      throw new NotFoundError("Lesson not found");
    }

    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new AuthorizationError("User not found");
    }

    // Only instructors and admins can delete lessons
    if (user.role !== "INSTRUCTOR" && user.role !== "ADMIN") {
      throw new AuthorizationError(
        "Only instructors and admins can delete lessons"
      );
    }

    await this.lessonRepo.delete(id);
  }

  /**
   * Reorder modules in course
   */
  async reorderModules(
    courseId: string,
    moduleIds: readonly string[],
    userId: string
  ): Promise<void> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new AuthorizationError("User not found");
    }

    // Only instructors and admins can reorder modules
    if (user.role !== "INSTRUCTOR" && user.role !== "ADMIN") {
      throw new AuthorizationError(
        "Only instructors and admins can reorder modules"
      );
    }

    await this.moduleRepo.reorderModules(courseId, moduleIds);
  }

  /**
   * Reorder lessons in module
   */
  async reorderLessons(
    moduleId: string,
    lessonIds: readonly string[],
    userId: string
  ): Promise<void> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new AuthorizationError("User not found");
    }

    // Only instructors and admins can reorder lessons
    if (user.role !== "INSTRUCTOR" && user.role !== "ADMIN") {
      throw new AuthorizationError(
        "Only instructors and admins can reorder lessons"
      );
    }

    await this.lessonRepo.reorderLessons(moduleId, lessonIds);
  }

  /**
   * Get lesson statistics
   */
  async getLessonStats(
    lessonId: string,
    userId: string
  ): Promise<{
    readonly viewCount: number;
    readonly completionRate: number;
    readonly averageWatchTime: number;
  }> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new AuthorizationError("User not found");
    }

    // Only instructors and admins can view lesson statistics
    if (user.role !== "INSTRUCTOR" && user.role !== "ADMIN") {
      throw new AuthorizationError(
        "Only instructors and admins can view lesson statistics"
      );
    }

    return await this.lessonRepo.getLessonStats(lessonId);
  }

  /**
   * Validate module data
   */
  private validateModuleData(data: CreateModuleData): void {
    const errors: string[] = [];

    if (!data.title || data.title.trim().length < 3) {
      errors.push("Module title must be at least 3 characters long");
    }

    if (!data.courseId) {
      errors.push("Course ID is required");
    }

    if (data.order < 0) {
      errors.push("Module order cannot be negative");
    }

    if (errors.length > 0) {
      throw new ValidationError("Invalid module data", { errors });
    }
  }

  /**
   * Validate lesson data
   */
  private validateLessonData(data: CreateLessonData): void {
    const errors: string[] = [];

    if (!data.title || data.title.trim().length < 3) {
      errors.push("Lesson title must be at least 3 characters long");
    }

    if (!data.moduleId) {
      errors.push("Module ID is required");
    }

    if (!data.type) {
      errors.push("Lesson type is required");
    }

    if (data.order < 0) {
      errors.push("Lesson order cannot be negative");
    }

    if (data.duration !== undefined && data.duration < 0) {
      errors.push("Lesson duration cannot be negative");
    }

    if (data.type === "VIDEO" && !data.videoUrl) {
      errors.push("Video URL is required for video lessons");
    }

    if (errors.length > 0) {
      throw new ValidationError("Invalid lesson data", { errors });
    }
  }
}
