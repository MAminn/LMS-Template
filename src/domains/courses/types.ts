import type {
  BaseEntity,
  CourseStatus,
  ProgressStatus,
} from "@/shared/types/global";
import type { User } from "@/domains/users/types";

/**
 * Course entity interface
 */
export interface Course extends BaseEntity {
  readonly title: string;
  readonly description: string;
  readonly thumbnail?: string;
  readonly price: number;
  readonly status: CourseStatus;
  readonly instructorId: string;
  readonly instructor: Pick<User, "id" | "name" | "email" | "avatar">;
  readonly category: string;
  readonly level: CourseLevel;
  readonly duration: number; // in minutes
  readonly language: string;
  readonly tags: readonly string[];
  readonly requirements: readonly string[];
  readonly learningObjectives: readonly string[];
  readonly studentsCount: number;
  readonly rating: number;
  readonly reviewsCount: number;
  readonly isPublished: boolean;
  readonly publishedAt?: Date;
}

/**
 * Course creation data
 */
export interface CreateCourseData {
  readonly title: string;
  readonly description: string;
  readonly price?: number;
  readonly category: string;
  readonly level: CourseLevel;
  readonly language?: string;
  readonly tags?: readonly string[];
  readonly requirements?: readonly string[];
  readonly learningObjectives?: readonly string[];
}

/**
 * Course update data
 */
export interface UpdateCourseData {
  readonly title?: string;
  readonly description?: string;
  readonly thumbnail?: string;
  readonly price?: number;
  readonly category?: string;
  readonly level?: CourseLevel;
  readonly language?: string;
  readonly tags?: readonly string[];
  readonly requirements?: readonly string[];
  readonly learningObjectives?: readonly string[];
}

/**
 * Course level types
 */
export type CourseLevel =
  | "BEGINNER"
  | "INTERMEDIATE"
  | "ADVANCED"
  | "ALL_LEVELS";

/**
 * Course with enrollment status
 */
export interface CourseWithEnrollment extends Course {
  readonly isEnrolled: boolean;
  readonly progress?: number;
  readonly lastAccessedAt?: Date;
}

/**
 * Course statistics
 */
export interface CourseStats {
  readonly courseId: string;
  readonly studentsCount: number;
  readonly completionRate: number;
  readonly averageRating: number;
  readonly totalRevenue: number;
  readonly enrollmentsThisMonth: number;
  readonly completionsThisMonth: number;
}

/**
 * Course review
 */
export interface CourseReview extends BaseEntity {
  readonly courseId: string;
  readonly studentId: string;
  readonly student: Pick<User, "id" | "name" | "avatar">;
  readonly rating: number;
  readonly comment?: string;
  readonly isApproved: boolean;
}

/**
 * Course enrollment
 */
export interface CourseEnrollment extends BaseEntity {
  readonly courseId: string;
  readonly studentId: string;
  readonly student: Pick<User, "id" | "name" | "email">;
  readonly course: Pick<Course, "id" | "title" | "thumbnail">;
  readonly progress: number;
  readonly status: ProgressStatus;
  readonly enrolledAt: Date;
  readonly completedAt?: Date;
  readonly certificateIssued: boolean;
}

/**
 * Course certificate
 */
export interface CourseCertificate extends BaseEntity {
  readonly courseId: string;
  readonly studentId: string;
  readonly course: Pick<Course, "id" | "title" | "instructor">;
  readonly student: Pick<User, "id" | "name" | "email">;
  readonly certificateNumber: string;
  readonly completionDate: Date;
  readonly issuedAt: Date;
  readonly isValid: boolean;
}

/**
 * Course search filters
 */
export interface CourseFilters {
  readonly category?: string;
  readonly level?: CourseLevel;
  readonly price?: "free" | "paid";
  readonly rating?: number;
  readonly duration?: "short" | "medium" | "long"; // < 2h, 2-10h, > 10h
  readonly language?: string;
  readonly instructor?: string;
}

/**
 * Course search result
 */
export interface CourseSearchResult {
  readonly courses: readonly Course[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
  readonly filters: CourseFilters;
}
