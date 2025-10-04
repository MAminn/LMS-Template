import type {
  Course,
  CreateCourseData,
  UpdateCourseData,
  CourseFilters,
} from "./types";
import type { PaginationParams } from "@/shared/types/global";

/**
 * Course repository interface
 * Defines all data access operations for courses
 */
export interface CourseRepository {
  /**
   * Find course by ID
   */
  findById(id: string): Promise<Course | null>;

  /**
   * Find courses by instructor
   */
  findByInstructor(
    instructorId: string,
    pagination?: PaginationParams
  ): Promise<readonly Course[]>;

  /**
   * Find published courses with filters
   */
  findPublished(
    filters?: CourseFilters,
    pagination?: PaginationParams
  ): Promise<{
    readonly courses: readonly Course[];
    readonly total: number;
  }>;

  /**
   * Search courses by text query
   */
  search(
    query: string,
    filters?: CourseFilters,
    pagination?: PaginationParams
  ): Promise<{
    readonly courses: readonly Course[];
    readonly total: number;
  }>;

  /**
   * Create new course
   */
  create(data: CreateCourseData, instructorId: string): Promise<Course>;

  /**
   * Update existing course
   */
  update(id: string, data: UpdateCourseData): Promise<Course>;

  /**
   * Delete course
   */
  delete(id: string): Promise<void>;

  /**
   * Publish course
   */
  publish(id: string): Promise<Course>;

  /**
   * Unpublish course
   */
  unpublish(id: string): Promise<Course>;

  /**
   * Get course statistics
   */
  getStats(id: string): Promise<{
    readonly studentsCount: number;
    readonly completionRate: number;
    readonly averageRating: number;
    readonly totalRevenue: number;
  }>;

  /**
   * Check if user can access course
   */
  canAccess(courseId: string, userId: string): Promise<boolean>;

  /**
   * Get featured courses
   */
  getFeatured(limit?: number): Promise<readonly Course[]>;

  /**
   * Get trending courses
   */
  getTrending(limit?: number): Promise<readonly Course[]>;

  /**
   * Get related courses
   */
  getRelated(courseId: string, limit?: number): Promise<readonly Course[]>;
}
