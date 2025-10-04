import type { BaseEntity, LessonType } from "@/shared/types/global";

/**
 * Module entity interface
 */
export interface Module extends BaseEntity {
  readonly title: string;
  readonly description?: string;
  readonly order: number;
  readonly courseId: string;
  readonly lessons: readonly Lesson[];
  readonly duration: number; // total duration in minutes
  readonly lessonsCount: number;
}

/**
 * Lesson entity interface
 */
export interface Lesson extends BaseEntity {
  readonly title: string;
  readonly description?: string;
  readonly content?: string;
  readonly type: LessonType;
  readonly order: number;
  readonly moduleId: string;
  readonly duration?: number; // in minutes
  readonly videoUrl?: string;
  readonly attachments: readonly LessonAttachment[];
  readonly isPreview: boolean;
  readonly isFree: boolean;
}

/**
 * Lesson attachment
 */
export interface LessonAttachment extends BaseEntity {
  readonly lessonId: string;
  readonly title: string;
  readonly description?: string;
  readonly fileUrl: string;
  readonly fileName: string;
  readonly fileSize: number;
  readonly fileType: string;
  readonly downloadCount: number;
}

/**
 * Module creation data
 */
export interface CreateModuleData {
  readonly title: string;
  readonly description?: string;
  readonly order: number;
  readonly courseId: string;
}

/**
 * Module update data
 */
export interface UpdateModuleData {
  readonly title?: string;
  readonly description?: string;
  readonly order?: number;
}

/**
 * Lesson creation data
 */
export interface CreateLessonData {
  readonly title: string;
  readonly description?: string;
  readonly content?: string;
  readonly type: LessonType;
  readonly order: number;
  readonly moduleId: string;
  readonly duration?: number;
  readonly videoUrl?: string;
  readonly isPreview?: boolean;
  readonly isFree?: boolean;
}

/**
 * Lesson update data
 */
export interface UpdateLessonData {
  readonly title?: string;
  readonly description?: string;
  readonly content?: string;
  readonly type?: LessonType;
  readonly order?: number;
  readonly duration?: number;
  readonly videoUrl?: string;
  readonly isPreview?: boolean;
  readonly isFree?: boolean;
}

/**
 * Video metadata
 */
export interface VideoMetadata {
  readonly url: string;
  readonly title?: string;
  readonly description?: string;
  readonly duration: number;
  readonly thumbnail?: string;
  readonly provider: "youtube" | "vimeo" | "direct";
  readonly providerId?: string;
}

/**
 * Content structure for course
 */
export interface CourseContent {
  readonly courseId: string;
  readonly modules: readonly ModuleWithLessons[];
  readonly totalDuration: number;
  readonly totalLessons: number;
}

/**
 * Module with lessons included
 */
export interface ModuleWithLessons extends Module {
  readonly lessons: readonly Lesson[];
}

/**
 * Lesson with progress
 */
export interface LessonWithProgress extends Lesson {
  readonly isCompleted: boolean;
  readonly completedAt?: Date;
  readonly watchTime?: number; // in seconds
  readonly lastPosition?: number; // video position in seconds
}

/**
 * Quiz question
 */
export interface QuizQuestion extends BaseEntity {
  readonly lessonId: string;
  readonly question: string;
  readonly type: QuestionType;
  readonly options: readonly string[];
  readonly correctAnswer: string | readonly string[];
  readonly explanation?: string;
  readonly points: number;
  readonly order: number;
}

/**
 * Question types for quizzes
 */
export type QuestionType =
  | "MULTIPLE_CHOICE"
  | "TRUE_FALSE"
  | "FILL_BLANK"
  | "ESSAY";

/**
 * Quiz attempt
 */
export interface QuizAttempt extends BaseEntity {
  readonly lessonId: string;
  readonly studentId: string;
  readonly answers: readonly QuizAnswer[];
  readonly score: number;
  readonly maxScore: number;
  readonly passed: boolean;
  readonly completedAt: Date;
  readonly timeSpent: number; // in seconds
}

/**
 * Quiz answer
 */
export interface QuizAnswer {
  readonly questionId: string;
  readonly answer: string | readonly string[];
  readonly isCorrect: boolean;
  readonly points: number;
}
