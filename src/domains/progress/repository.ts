import type {
  Progress,
  CreateProgressData,
  UpdateProgressData,
  LessonProgress,
  CourseProgress,
  UserProgress,
  CreateLessonProgressData,
  UpdateLessonProgressData,
} from "./types";
import type { PaginationParams } from "@/shared/types/global";

/**
 * Progress repository interface
 * Defines all data access operations for progress tracking
 */
export interface ProgressRepository {
  /**
   * Find progress by ID
   */
  findById(id: string): Promise<Progress | null>;

  /**
   * Find progress by course and user
   */
  findByCourseAndUser(
    courseId: string,
    userId: string
  ): Promise<Progress | null>;

  /**
   * Find progress by user
   */
  findByUser(
    userId: string,
    pagination?: PaginationParams
  ): Promise<readonly Progress[]>;

  /**
   * Create new progress record
   */
  create(data: CreateProgressData): Promise<Progress>;

  /**
   * Update existing progress
   */
  update(id: string, data: UpdateProgressData): Promise<Progress>;

  /**
   * Delete progress record
   */
  delete(id: string): Promise<void>;

  /**
   * Get course progress with detailed information
   */
  getCourseProgress(
    courseId: string,
    userId: string
  ): Promise<CourseProgress | null>;

  /**
   * Get lesson progress
   */
  getLessonProgress(
    lessonId: string,
    userId: string
  ): Promise<LessonProgress | null>;

  /**
   * Create lesson progress
   */
  createLessonProgress(data: CreateLessonProgressData): Promise<LessonProgress>;

  /**
   * Update lesson progress
   */
  updateLessonProgress(
    lessonId: string,
    userId: string,
    data: UpdateLessonProgressData
  ): Promise<LessonProgress>;

  /**
   * Get user progress across all courses
   */
  getUserProgress(
    userId: string,
    pagination?: PaginationParams
  ): Promise<UserProgress>;

  /**
   * Get course progress statistics
   */
  getCourseProgressStats(
    courseId: string,
    userId: string
  ): Promise<{
    readonly totalLessons: number;
    readonly completedLessons: number;
    readonly totalWatchTime: number;
    readonly totalDuration: number;
  }>;

  /**
   * Reset course progress
   */
  resetCourseProgress(courseId: string, userId: string): Promise<void>;

  /**
   * Get instructor statistics
   */
  getInstructorStats(instructorId: string): Promise<{
    readonly totalStudents: number;
    readonly activeCourses: number;
    readonly completionRate: number;
    readonly averageProgress: number;
  }>;

  /**
   * Get certificate data for completed course
   */
  getCertificateData(
    courseId: string,
    userId: string
  ): Promise<{
    readonly courseTitle: string;
    readonly userName: string;
    readonly completedAt: Date;
    readonly completionPercentage: number;
    readonly certificateId: string;
  }>;

  /**
   * Get progress analytics for admin dashboard
   */
  getProgressAnalytics(timeframe?: "day" | "week" | "month" | "year"): Promise<{
    readonly newEnrollments: number;
    readonly completions: number;
    readonly averageCompletionTime: number;
    readonly dropoffRate: number;
  }>;

  /**
   * Get popular courses by completion rate
   */
  getPopularCoursesByCompletion(limit?: number): Promise<
    Array<{
      readonly courseId: string;
      readonly courseTitle: string;
      readonly enrollmentCount: number;
      readonly completionCount: number;
      readonly completionRate: number;
    }>
  >;
}
