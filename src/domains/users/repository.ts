import type {
  User,
  CreateUserData,
  UpdateUserData,
  UserProfile,
} from "./types";
import type { PaginationParams, UserRole } from "@/shared/types/global";

/**
 * User repository interface
 * Defines all data access operations for users
 */
export interface UserRepository {
  /**
   * Find user by ID
   */
  findById(id: string): Promise<User | null>;

  /**
   * Find user by email
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Find users by role
   */
  findByRole(
    role: UserRole,
    pagination?: PaginationParams
  ): Promise<readonly User[]>;

  /**
   * Create new user
   */
  create(data: CreateUserData): Promise<User>;

  /**
   * Update existing user
   */
  update(id: string, data: UpdateUserData): Promise<User>;

  /**
   * Delete user
   */
  delete(id: string): Promise<void>;

  /**
   * Get user profile
   */
  getProfile(id: string): Promise<UserProfile | null>;

  /**
   * Update user profile
   */
  updateProfile(id: string, data: Partial<UserProfile>): Promise<UserProfile>;

  /**
   * Verify user email
   */
  verifyEmail(id: string): Promise<User>;

  /**
   * Update last login timestamp
   */
  updateLastLogin(id: string): Promise<void>;

  /**
   * Search users by name or email
   */
  search(
    query: string,
    pagination?: PaginationParams
  ): Promise<{
    readonly users: readonly User[];
    readonly total: number;
  }>;

  /**
   * Check if email exists
   */
  emailExists(email: string): Promise<boolean>;

  /**
   * Get user statistics
   */
  getStats(id: string): Promise<{
    readonly coursesCreated?: number;
    readonly studentsCount?: number;
    readonly coursesEnrolled?: number;
    readonly coursesCompleted?: number;
  }>;
}
