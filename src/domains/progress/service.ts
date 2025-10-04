import type {
  Progress,
  CreateProgressData,
  UpdateProgressData,
  LessonProgress,
  CourseProgress,
  UserProgress,
} from "./types";
import type { ProgressStatus } from "@/shared/types/global";
import type { ProgressRepository } from "./repository";
import type { UserRepository } from "@/domains/users/repository";
import type { PaginationParams } from "@/shared/types/global";
import {
  NotFoundError,
  AuthorizationError,
  ValidationError,
} from "@/shared/errors/AppError";

/**
 * Progress service - handles business logic for user progress tracking
 */
export class ProgressService {
  constructor(
    private readonly progressRepo: ProgressRepository,
    private readonly userRepo: UserRepository
  ) {}

  /**
   * Get user progress for a course
   */
  async getCourseProgress(
    courseId: string,
    userId: string,
    requesterId: string
  ): Promise<CourseProgress> {
    // Check permissions - users can see their own progress, admins can see all
    if (userId !== requesterId) {
      const requester = await this.userRepo.findById(requesterId);
      if (!requester || requester.role !== "ADMIN") {
        throw new AuthorizationError("Not authorized to view this progress");
      }
    }

    const progress = await this.progressRepo.getCourseProgress(
      courseId,
      userId
    );
    if (!progress) {
      throw new NotFoundError("Course progress not found");
    }

    return progress;
  }

  /**
   * Get user progress for a lesson
   */
  async getLessonProgress(
    lessonId: string,
    userId: string,
    requesterId: string
  ): Promise<LessonProgress> {
    // Check permissions
    if (userId !== requesterId) {
      const requester = await this.userRepo.findById(requesterId);
      if (!requester || requester.role !== "ADMIN") {
        throw new AuthorizationError("Not authorized to view this progress");
      }
    }

    const progress = await this.progressRepo.getLessonProgress(
      lessonId,
      userId
    );
    if (!progress) {
      throw new NotFoundError("Lesson progress not found");
    }

    return progress;
  }

  /**
   * Start course progress tracking
   */
  async startCourse(courseId: string, userId: string): Promise<Progress> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Check if progress already exists
    const existingProgress = await this.progressRepo.findByCourseAndUser(
      courseId,
      userId
    );
    if (existingProgress) {
      return existingProgress;
    }

    const progressData: CreateProgressData = {
      userId,
      courseId,
      status: "IN_PROGRESS",
      completionPercentage: 0,
      startedAt: new Date(),
    };

    return await this.progressRepo.create(progressData);
  }

  /**
   * Complete a lesson
   */
  async completeLesson(
    lessonId: string,
    userId: string,
    watchTime?: number
  ): Promise<LessonProgress> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Get or create lesson progress
    let lessonProgress = await this.progressRepo.getLessonProgress(
      lessonId,
      userId
    );

    if (!lessonProgress) {
      // Create new lesson progress
      const progressData = {
        lessonId,
        userId,
        isCompleted: true,
        completedAt: new Date(),
        watchTime: watchTime || 0,
      };
      lessonProgress = await this.progressRepo.createLessonProgress(
        progressData
      );
    } else if (!lessonProgress.isCompleted) {
      // Update existing progress
      lessonProgress = await this.progressRepo.updateLessonProgress(
        lessonId,
        userId,
        {
          isCompleted: true,
          completedAt: new Date(),
          watchTime: watchTime || lessonProgress.watchTime,
        }
      );
    }

    // Update course progress
    await this.updateCourseProgressFromLessons(lessonProgress.courseId, userId);

    return lessonProgress;
  }

  /**
   * Update lesson watch time
   */
  async updateWatchTime(
    lessonId: string,
    userId: string,
    watchTime: number,
    lastPosition?: number
  ): Promise<LessonProgress> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Get or create lesson progress
    let lessonProgress = await this.progressRepo.getLessonProgress(
      lessonId,
      userId
    );

    if (!lessonProgress) {
      // Create new lesson progress
      const progressData = {
        lessonId,
        userId,
        isCompleted: false,
        watchTime,
        lastPosition: lastPosition || 0,
      };
      lessonProgress = await this.progressRepo.createLessonProgress(
        progressData
      );
    } else {
      // Update existing progress
      lessonProgress = await this.progressRepo.updateLessonProgress(
        lessonId,
        userId,
        {
          watchTime: Math.max(watchTime, lessonProgress.watchTime || 0),
          lastPosition:
            lastPosition !== undefined
              ? lastPosition
              : lessonProgress.lastPosition,
        }
      );
    }

    return lessonProgress;
  }

  /**
   * Get overall user progress across all courses
   */
  async getUserProgress(
    userId: string,
    requesterId: string,
    pagination?: PaginationParams
  ): Promise<UserProgress> {
    // Check permissions
    if (userId !== requesterId) {
      const requester = await this.userRepo.findById(requesterId);
      if (!requester || requester.role !== "ADMIN") {
        throw new AuthorizationError("Not authorized to view this progress");
      }
    }

    return await this.progressRepo.getUserProgress(userId, pagination);
  }

  /**
   * Get progress statistics for instructor
   */
  async getInstructorStats(
    instructorId: string,
    requesterId: string
  ): Promise<{
    readonly totalStudents: number;
    readonly activeCourses: number;
    readonly completionRate: number;
    readonly averageProgress: number;
  }> {
    const requester = await this.userRepo.findById(requesterId);
    if (!requester) {
      throw new NotFoundError("User not found");
    }

    // Only instructors can see their own stats, admins can see all
    if (instructorId !== requesterId && requester.role !== "ADMIN") {
      throw new AuthorizationError("Not authorized to view these statistics");
    }

    return await this.progressRepo.getInstructorStats(instructorId);
  }

  /**
   * Reset course progress
   */
  async resetCourseProgress(
    courseId: string,
    userId: string,
    requesterId: string
  ): Promise<void> {
    // Check permissions - users can reset their own progress, admins can reset any
    if (userId !== requesterId) {
      const requester = await this.userRepo.findById(requesterId);
      if (!requester || requester.role !== "ADMIN") {
        throw new AuthorizationError("Not authorized to reset this progress");
      }
    }

    const progress = await this.progressRepo.findByCourseAndUser(
      courseId,
      userId
    );
    if (!progress) {
      throw new NotFoundError("Course progress not found");
    }

    await this.progressRepo.resetCourseProgress(courseId, userId);
  }

  /**
   * Get course completion certificate data
   */
  async getCertificateData(
    courseId: string,
    userId: string,
    requesterId: string
  ): Promise<{
    readonly courseTitle: string;
    readonly userName: string;
    readonly completedAt: Date;
    readonly completionPercentage: number;
    readonly certificateId: string;
  }> {
    // Check permissions
    if (userId !== requesterId) {
      const requester = await this.userRepo.findById(requesterId);
      if (!requester || requester.role !== "ADMIN") {
        throw new AuthorizationError("Not authorized to view this certificate");
      }
    }

    const progress = await this.progressRepo.findByCourseAndUser(
      courseId,
      userId
    );
    if (!progress) {
      throw new NotFoundError("Course progress not found");
    }

    if (progress.status !== "COMPLETED") {
      throw new ValidationError("Course is not completed yet");
    }

    return await this.progressRepo.getCertificateData(courseId, userId);
  }

  /**
   * Update course progress based on lesson completions
   */
  private async updateCourseProgressFromLessons(
    courseId: string,
    userId: string
  ): Promise<void> {
    const courseProgress = await this.progressRepo.getCourseProgress(
      courseId,
      userId
    );
    if (!courseProgress) {
      return;
    }

    const stats = await this.progressRepo.getCourseProgressStats(
      courseId,
      userId
    );
    const completionPercentage = Math.round(
      (stats.completedLessons / stats.totalLessons) * 100
    );

    const updateData: UpdateProgressData = {
      completionPercentage,
      lastAccessedAt: new Date(),
    };

    // Mark as completed if all lessons are done
    const finalUpdateData: UpdateProgressData = {
      ...updateData,
      ...(completionPercentage >= 100 && {
        status: "COMPLETED" as ProgressStatus,
        completedAt: new Date(),
      }),
    };

    await this.progressRepo.update(courseProgress.id, finalUpdateData);
  }
}
