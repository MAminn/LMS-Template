import type {
  User,
  CreateUserData,
  UpdateUserData,
  UserProfile,
} from "./types";
import type { UserRepository } from "./repository";
import type { PaginationParams, UserRole } from "@/shared/types/global";
import {
  NotFoundError,
  AuthorizationError,
  ValidationError,
  ConflictError,
} from "@/shared/errors/AppError";

/**
 * User service - handles business logic for user operations
 */
export class UserService {
  constructor(private readonly userRepo: UserRepository) {}

  /**
   * Get user by ID
   */
  async getUser(id: string, requesterId?: string): Promise<User> {
    const user = await this.userRepo.findById(id);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Users can see their own profile, admins can see all profiles
    if (requesterId && requesterId !== id) {
      const requester = await this.userRepo.findById(requesterId);
      if (!requester || requester.role !== "ADMIN") {
        throw new AuthorizationError("Not authorized to view this profile");
      }
    }

    return user;
  }

  /**
   * Get user profile
   */
  async getUserProfile(id: string, requesterId?: string): Promise<UserProfile> {
    // Verify access permissions
    if (requesterId && requesterId !== id) {
      const requester = await this.userRepo.findById(requesterId);
      if (!requester || requester.role !== "ADMIN") {
        throw new AuthorizationError("Not authorized to view this profile");
      }
    }

    const profile = await this.userRepo.getProfile(id);
    if (!profile) {
      throw new NotFoundError("User profile not found");
    }

    return profile;
  }

  /**
   * Create new user
   */
  async createUser(data: CreateUserData): Promise<User> {
    // Validate email uniqueness
    const existingUser = await this.userRepo.findByEmail(data.email);
    if (existingUser) {
      throw new ConflictError("Email already exists");
    }

    // Validate user data
    this.validateUserData(data);

    const userData = {
      ...data,
      role: data.role || "STUDENT",
    };

    return await this.userRepo.create(userData);
  }

  /**
   * Update user
   */
  async updateUser(
    id: string,
    data: UpdateUserData,
    requesterId: string
  ): Promise<User> {
    const user = await this.userRepo.findById(id);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Check permissions
    const requester = await this.userRepo.findById(requesterId);
    if (!requester) {
      throw new AuthorizationError("Requester not found");
    }

    // Users can update their own profile, admins can update any profile
    if (requesterId !== id && requester.role !== "ADMIN") {
      throw new AuthorizationError("Not authorized to update this profile");
    }

    return await this.userRepo.update(id, data);
  }

  /**
   * Delete user
   */
  async deleteUser(id: string, requesterId: string): Promise<void> {
    const user = await this.userRepo.findById(id);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const requester = await this.userRepo.findById(requesterId);
    if (!requester) {
      throw new AuthorizationError("Requester not found");
    }

    // Users can delete their own account, admins can delete any account
    if (requesterId !== id && requester.role !== "ADMIN") {
      throw new AuthorizationError("Not authorized to delete this account");
    }

    // Prevent deleting the last admin
    if (user.role === "ADMIN") {
      const adminUsers = await this.userRepo.findByRole("ADMIN");
      if (adminUsers.length <= 1) {
        throw new ValidationError("Cannot delete the last admin user");
      }
    }

    await this.userRepo.delete(id);
  }

  /**
   * Update user profile
   */
  async updateProfile(
    id: string,
    data: Partial<UserProfile>,
    requesterId: string
  ): Promise<UserProfile> {
    // Check permissions
    if (requesterId !== id) {
      const requester = await this.userRepo.findById(requesterId);
      if (!requester || requester.role !== "ADMIN") {
        throw new AuthorizationError("Not authorized to update this profile");
      }
    }

    const user = await this.userRepo.findById(id);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    return await this.userRepo.updateProfile(id, data);
  }

  /**
   * Verify user email
   */
  async verifyEmail(id: string): Promise<User> {
    const user = await this.userRepo.findById(id);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (user.isEmailVerified) {
      throw new ValidationError("Email is already verified");
    }

    return await this.userRepo.verifyEmail(id);
  }

  /**
   * Search users
   */
  async searchUsers(
    query: string,
    requesterId: string,
    pagination?: PaginationParams
  ): Promise<{
    readonly users: readonly User[];
    readonly total: number;
  }> {
    const requester = await this.userRepo.findById(requesterId);
    if (!requester || requester.role !== "ADMIN") {
      throw new AuthorizationError("Only admins can search users");
    }

    return await this.userRepo.search(query, pagination);
  }

  /**
   * Get users by role
   */
  async getUsersByRole(
    role: UserRole,
    requesterId: string,
    pagination?: PaginationParams
  ): Promise<readonly User[]> {
    const requester = await this.userRepo.findById(requesterId);
    if (!requester || requester.role !== "ADMIN") {
      throw new AuthorizationError("Only admins can view users by role");
    }

    return await this.userRepo.findByRole(role, pagination);
  }

  /**
   * Get user statistics
   */
  async getUserStats(
    id: string,
    requesterId: string
  ): Promise<{
    readonly coursesCreated?: number;
    readonly studentsCount?: number;
    readonly coursesEnrolled?: number;
    readonly coursesCompleted?: number;
  }> {
    // Users can see their own stats, admins can see all stats
    if (requesterId !== id) {
      const requester = await this.userRepo.findById(requesterId);
      if (!requester || requester.role !== "ADMIN") {
        throw new AuthorizationError("Not authorized to view these statistics");
      }
    }

    const user = await this.userRepo.findById(id);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    return await this.userRepo.getStats(id);
  }

  /**
   * Update last login timestamp
   */
  async updateLastLogin(id: string): Promise<void> {
    const user = await this.userRepo.findById(id);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    await this.userRepo.updateLastLogin(id);
  }

  /**
   * Validate user data
   */
  private validateUserData(data: CreateUserData): void {
    const errors: string[] = [];

    if (!data.email || !data.email.includes("@")) {
      errors.push("Valid email is required");
    }

    if (!data.name || data.name.trim().length < 2) {
      errors.push("Name must be at least 2 characters long");
    }

    if (data.role && !["STUDENT", "INSTRUCTOR", "ADMIN"].includes(data.role)) {
      errors.push("Valid role is required (STUDENT, INSTRUCTOR, or ADMIN)");
    }

    if (errors.length > 0) {
      throw new ValidationError("Invalid user data", { errors });
    }
  }
}
