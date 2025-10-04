import type { BaseEntity, ProgressStatus } from "@/shared/types/global";
import type { Course } from "@/domains/courses/types";
import type { Lesson } from "@/domains/content/types";
import type { User } from "@/domains/users/types";

/**
 * Main progress entity
 */
export interface Progress extends BaseEntity {
  readonly userId: string;
  readonly courseId: string;
  readonly status: ProgressStatus;
  readonly completionPercentage: number;
  readonly startedAt: Date;
  readonly completedAt?: Date;
  readonly lastAccessedAt?: Date;
}

/**
 * Progress creation data
 */
export interface CreateProgressData {
  readonly userId: string;
  readonly courseId: string;
  readonly status: ProgressStatus;
  readonly completionPercentage: number;
  readonly startedAt: Date;
}

/**
 * Progress update data
 */
export interface UpdateProgressData {
  readonly status?: ProgressStatus;
  readonly completionPercentage?: number;
  readonly completedAt?: Date;
  readonly lastAccessedAt?: Date;
}

/**
 * Lesson progress creation data
 */
export interface CreateLessonProgressData {
  readonly lessonId: string;
  readonly userId: string;
  readonly isCompleted: boolean;
  readonly completedAt?: Date;
  readonly watchTime?: number;
  readonly lastPosition?: number;
}

/**
 * Lesson progress update data
 */
export interface UpdateLessonProgressData {
  readonly isCompleted?: boolean;
  readonly completedAt?: Date;
  readonly watchTime?: number;
  readonly lastPosition?: number;
}

/**
 * User progress summary
 */
export interface UserProgress {
  readonly userId: string;
  readonly coursesEnrolled: number;
  readonly coursesCompleted: number;
  readonly coursesInProgress: number;
  readonly totalWatchTime: number;
  readonly achievements: number;
  readonly currentStreak: number;
  readonly courses: readonly CourseProgress[];
}

/**
 * Lesson progress entity
 */
export interface LessonProgress extends BaseEntity {
  readonly studentId: string;
  readonly lessonId: string;
  readonly courseId: string;
  readonly lesson: Pick<Lesson, "id" | "title" | "type" | "duration">;
  readonly isCompleted: boolean;
  readonly completedAt?: Date;
  readonly watchTime: number; // in seconds
  readonly lastPosition: number; // video position in seconds
  readonly attempts: number;
}

/**
 * Course progress entity
 */
export interface CourseProgress extends BaseEntity {
  readonly studentId: string;
  readonly courseId: string;
  readonly course: Pick<Course, "id" | "title" | "thumbnail">;
  readonly student: Pick<User, "id" | "name" | "email">;
  readonly status: ProgressStatus;
  readonly progress: number; // percentage 0-100
  readonly completedLessons: number;
  readonly totalLessons: number;
  readonly timeSpent: number; // total time in seconds
  readonly lastAccessedAt: Date;
  readonly startedAt: Date;
  readonly completedAt?: Date;
  readonly certificateEarned: boolean;
}

/**
 * Learning session
 */
export interface LearningSession extends BaseEntity {
  readonly studentId: string;
  readonly courseId: string;
  readonly lessonId: string;
  readonly startedAt: Date;
  readonly endedAt?: Date;
  readonly duration: number; // in seconds
  readonly completed: boolean;
  readonly deviceType: "desktop" | "mobile" | "tablet";
  readonly ipAddress?: string;
}

/**
 * Progress update data (for repository layer)
 */
export interface UpdateLessonProgressInput {
  readonly lessonId: string;
  readonly studentId: string;
  readonly watchTime?: number;
  readonly lastPosition?: number;
  readonly completed?: boolean;
}

/**
 * Student analytics
 */
export interface StudentAnalytics {
  readonly studentId: string;
  readonly totalCourses: number;
  readonly completedCourses: number;
  readonly inProgressCourses: number;
  readonly totalLessons: number;
  readonly completedLessons: number;
  readonly totalWatchTime: number; // in seconds
  readonly averageProgress: number;
  readonly longestStreak: number; // days
  readonly currentStreak: number; // days
  readonly certificatesEarned: number;
  readonly lastActivity: Date;
}

/**
 * Course analytics for instructors
 */
export interface CourseAnalytics {
  readonly courseId: string;
  readonly totalStudents: number;
  readonly activeStudents: number; // active in last 30 days
  readonly completedStudents: number;
  readonly averageProgress: number;
  readonly averageCompletionTime: number; // in days
  readonly retentionRate: number;
  readonly engagementRate: number;
  readonly popularLessons: readonly LessonEngagement[];
  readonly dropoffPoints: readonly DropoffPoint[];
}

/**
 * Lesson engagement metrics
 */
export interface LessonEngagement {
  readonly lessonId: string;
  readonly lessonTitle: string;
  readonly views: number;
  readonly completions: number;
  readonly averageWatchTime: number;
  readonly completionRate: number;
  readonly rewatches: number;
}

/**
 * Course dropoff analysis
 */
export interface DropoffPoint {
  readonly lessonId: string;
  readonly lessonTitle: string;
  readonly dropoffRate: number;
  readonly position: number; // lesson position in course
  readonly studentsReached: number;
  readonly studentsCompleted: number;
}

/**
 * Learning path progress
 */
export interface LearningPathProgress {
  readonly pathId: string;
  readonly studentId: string;
  readonly coursesCompleted: number;
  readonly totalCourses: number;
  readonly progress: number;
  readonly estimatedCompletionDate: Date;
  readonly startedAt: Date;
  readonly completedAt?: Date;
}

/**
 * Achievement/Badge
 */
export interface Achievement extends BaseEntity {
  readonly title: string;
  readonly description: string;
  readonly icon: string;
  readonly category: AchievementCategory;
  readonly points: number;
  readonly rarity: AchievementRarity;
  readonly requirements: AchievementRequirement[];
}

/**
 * Achievement categories
 */
export type AchievementCategory =
  | "COMPLETION"
  | "STREAK"
  | "SPEED"
  | "ENGAGEMENT"
  | "SOCIAL"
  | "SPECIAL";

/**
 * Achievement rarity levels
 */
export type AchievementRarity =
  | "COMMON"
  | "UNCOMMON"
  | "RARE"
  | "EPIC"
  | "LEGENDARY";

/**
 * Achievement requirements
 */
export interface AchievementRequirement {
  readonly type:
    | "COURSE_COMPLETION"
    | "LESSON_COMPLETION"
    | "STREAK_DAYS"
    | "WATCH_TIME"
    | "QUIZ_SCORE";
  readonly value: number;
  readonly courseId?: string;
  readonly category?: string;
}

/**
 * Student achievement
 */
export interface StudentAchievement extends BaseEntity {
  readonly studentId: string;
  readonly achievementId: string;
  readonly achievement: Achievement;
  readonly earnedAt: Date;
  readonly progress: number; // for progressive achievements
}

/**
 * Daily activity
 */
export interface DailyActivity {
  readonly date: Date;
  readonly studentId: string;
  readonly lessonsCompleted: number;
  readonly watchTime: number;
  readonly coursesAccessed: number;
  readonly quizzesTaken: number;
  readonly streak: number;
}
