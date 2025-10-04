/**
 * Global type definitions for The Academy LMS
 */

/**
 * Common entity properties
 */
export interface BaseEntity {
  readonly id: string;
  readonly createdAt: Date;
  readonly updatedAt?: Date;
}

/**
 * API Response wrapper
 */
export interface ApiResponse<T = unknown> {
  readonly success: boolean;
  readonly data?: T;
  readonly error?: {
    readonly code: string;
    readonly message: string;
    readonly details?: Record<string, unknown>;
  };
  readonly meta?: {
    readonly page?: number;
    readonly limit?: number;
    readonly total?: number;
  };
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  readonly page?: number;
  readonly limit?: number;
  readonly sortBy?: string;
  readonly sortOrder?: "asc" | "desc";
}

/**
 * User roles in the system
 */
export type UserRole = "ADMIN" | "INSTRUCTOR" | "STUDENT";

/**
 * Course status types
 */
export type CourseStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

/**
 * Lesson content types
 */
export type LessonType = "VIDEO" | "TEXT" | "QUIZ" | "ASSIGNMENT";

/**
 * Progress status types
 */
export type ProgressStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

/**
 * File upload constraints
 */
export interface FileUploadConfig {
  readonly maxSize: number;
  readonly allowedTypes: readonly string[];
  readonly maxFiles?: number;
}

/**
 * Search and filter interfaces
 */
export interface SearchParams {
  readonly query?: string;
  readonly category?: string;
  readonly level?: string;
  readonly price?: "free" | "paid";
}

/**
 * Feature flags for premium features
 */
export interface FeatureFlags {
  readonly analytics: boolean;
  readonly customBranding: boolean;
  readonly advancedReporting: boolean;
  readonly sso: boolean;
  readonly api: boolean;
}

/**
 * System configuration
 */
export interface SystemConfig {
  readonly siteName: string;
  readonly siteUrl: string;
  readonly supportEmail: string;
  readonly features: FeatureFlags;
}

/**
 * Validation result
 */
export interface ValidationResult {
  readonly isValid: boolean;
  readonly errors: readonly string[];
}

/**
 * Email template data
 */
export interface EmailTemplateData {
  readonly to: string;
  readonly subject: string;
  readonly template: string;
  readonly data: Record<string, unknown>;
}
