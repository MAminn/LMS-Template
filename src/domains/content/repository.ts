import type {
  Module,
  Lesson,
  CreateModuleData,
  UpdateModuleData,
  CreateLessonData,
  UpdateLessonData,
  ModuleWithLessons,
} from "./types";
import type { PaginationParams } from "@/shared/types/global";

/**
 * Module repository interface
 * Defines all data access operations for modules
 */
export interface ModuleRepository {
  /**
   * Find module by ID
   */
  findById(id: string): Promise<Module | null>;

  /**
   * Find modules by course ID
   */
  findByCourseId(
    courseId: string,
    pagination?: PaginationParams
  ): Promise<readonly Module[]>;

  /**
   * Find module with lessons
   */
  findByIdWithLessons(id: string): Promise<ModuleWithLessons | null>;

  /**
   * Create new module
   */
  create(data: CreateModuleData): Promise<Module>;

  /**
   * Update existing module
   */
  update(id: string, data: UpdateModuleData): Promise<Module>;

  /**
   * Delete module
   */
  delete(id: string): Promise<void>;

  /**
   * Reorder modules in course
   */
  reorderModules(courseId: string, moduleIds: readonly string[]): Promise<void>;
}

/**
 * Lesson repository interface
 * Defines all data access operations for lessons
 */
export interface LessonRepository {
  /**
   * Find lesson by ID
   */
  findById(id: string): Promise<Lesson | null>;

  /**
   * Find lessons by module ID
   */
  findByModuleId(
    moduleId: string,
    pagination?: PaginationParams
  ): Promise<readonly Lesson[]>;

  /**
   * Create new lesson
   */
  create(data: CreateLessonData): Promise<Lesson>;

  /**
   * Update existing lesson
   */
  update(id: string, data: UpdateLessonData): Promise<Lesson>;

  /**
   * Delete lesson
   */
  delete(id: string): Promise<void>;

  /**
   * Reorder lessons in module
   */
  reorderLessons(moduleId: string, lessonIds: readonly string[]): Promise<void>;

  /**
   * Get lesson statistics
   */
  getLessonStats(lessonId: string): Promise<{
    readonly viewCount: number;
    readonly completionRate: number;
    readonly averageWatchTime: number;
  }>;
}
