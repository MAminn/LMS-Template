import type { BaseEntity, UserRole } from "@/shared/types/global";

/**
 * User entity interface
 */
export interface User extends BaseEntity {
  readonly email: string;
  readonly name: string;
  readonly role: UserRole;
  readonly avatar?: string;
  readonly isEmailVerified: boolean;
  readonly lastLoginAt?: Date;
  readonly preferences: UserPreferences;
}

/**
 * User preferences
 */
export interface UserPreferences {
  readonly theme: "light" | "dark" | "system";
  readonly language: string;
  readonly timezone: string;
  readonly emailNotifications: boolean;
  readonly marketingEmails: boolean;
}

/**
 * User creation data
 */
export interface CreateUserData {
  readonly email: string;
  readonly name: string;
  readonly password: string;
  readonly role?: UserRole;
}

/**
 * User update data
 */
export interface UpdateUserData {
  readonly name?: string;
  readonly avatar?: string;
  readonly preferences?: Partial<UserPreferences>;
}

/**
 * User profile data
 */
export interface UserProfile extends Omit<User, "preferences"> {
  readonly bio?: string;
  readonly website?: string;
  readonly socialLinks: SocialLinks;
  readonly expertise: readonly string[];
  readonly coursesCreated: number;
  readonly studentsCount: number;
}

/**
 * Social media links
 */
export interface SocialLinks {
  readonly twitter?: string;
  readonly linkedin?: string;
  readonly github?: string;
  readonly website?: string;
}

/**
 * Password reset request
 */
export interface PasswordResetRequest {
  readonly email: string;
  readonly token: string;
  readonly expiresAt: Date;
}

/**
 * Email verification data
 */
export interface EmailVerification {
  readonly userId: string;
  readonly token: string;
  readonly expiresAt: Date;
}

/**
 * User authentication data
 */
export interface AuthUser {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly role: UserRole;
  readonly avatar?: string;
}

/**
 * Login credentials
 */
export interface LoginCredentials {
  readonly email: string;
  readonly password: string;
}

/**
 * Registration data
 */
export interface RegistrationData extends CreateUserData {
  readonly confirmPassword: string;
  readonly agreeToTerms: boolean;
}
