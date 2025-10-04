import type {
  Course,
  CreateCourseData,
  UpdateCourseData,
  CourseFilters,
} from "./types";
import type { CourseRepository } from "./repository";
import type { UserRepository } from "@/domains/users/repository";
import type { PaginationParams } from "@/shared/types/global";
import {
  NotFoundError,
  AuthorizationError,
  ValidationError,
} from "@/shared/errors/AppError";

/**
 * Course service - handles business logic for course operations
 */
export class CourseService {
  constructor(
    private readonly courseRepo: CourseRepository,
    private readonly userRepo: UserRepository
  ) {}

  /**
   * Get course by ID with access control
   */
  async getCourse(id: string, userId?: string): Promise<Course> {
    const course = await this.courseRepo.findById(id);
    if (!course) {
      throw new NotFoundError("Course", id);
    }

    // Check if user can access the course
    if (userId && !course.isPublished) {
      const user = await this.userRepo.findById(userId);
      if (!user || (user.role !== "ADMIN" && course.instructorId !== userId)) {
        throw new AuthorizationError("Access denied to unpublished course");
      }
    } else if (!course.isPublished && !userId) {
      throw new NotFoundError("Course", id);
    }

    return course;
  }

  /**
   * Get courses by instructor
   */
  async getCoursesByInstructor(
    instructorId: string,
    requesterId?: string,
    pagination?: PaginationParams
  ): Promise<readonly Course[]> {
    // Verify instructor exists
    const instructor = await this.userRepo.findById(instructorId);
    if (!instructor) {
      throw new NotFoundError("Instructor", instructorId);
    }

    if (instructor.role !== "INSTRUCTOR" && instructor.role !== "ADMIN") {
      throw new ValidationError("User is not an instructor");
    }

    const courses = await this.courseRepo.findByInstructor(
      instructorId,
      pagination
    );

    // Filter out unpublished courses if requester is not the instructor or admin
    if (requesterId !== instructorId) {
      const requester = requesterId
        ? await this.userRepo.findById(requesterId)
        : null;
      if (!requester || requester.role !== "ADMIN") {
        return courses.filter((course) => course.isPublished);
      }
    }

    return courses;
  }

  /**
   * Search and filter published courses
   */
  async searchCourses(
    query?: string,
    filters?: CourseFilters,
    pagination?: PaginationParams
  ): Promise<{
    readonly courses: readonly Course[];
    readonly total: number;
  }> {
    if (query && query.trim()) {
      return this.courseRepo.search(query.trim(), filters, pagination);
    }

    return this.courseRepo.findPublished(filters, pagination);
  }

  /**
   * Create new course
   */
  async createCourse(
    data: CreateCourseData,
    instructorId: string
  ): Promise<Course> {
    // Verify instructor exists and has permission
    const instructor = await this.userRepo.findById(instructorId);
    if (!instructor) {
      throw new NotFoundError("Instructor", instructorId);
    }

    if (instructor.role !== "INSTRUCTOR" && instructor.role !== "ADMIN") {
      throw new AuthorizationError("Only instructors can create courses");
    }

    // Validate course data
    this.validateCourseData(data);

    return this.courseRepo.create(data, instructorId);
  }

  /**
   * Update existing course
   */
  async updateCourse(
    id: string,
    data: UpdateCourseData,
    userId: string
  ): Promise<Course> {
    const course = await this.courseRepo.findById(id);
    if (!course) {
      throw new NotFoundError("Course", id);
    }

    // Check permissions
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundError("User", userId);
    }

    if (user.role !== "ADMIN" && course.instructorId !== userId) {
      throw new AuthorizationError("You can only update your own courses");
    }

    // Validate update data
    if (data.title || data.description || data.category) {
      this.validateCourseData(data as CreateCourseData);
    }

    return this.courseRepo.update(id, data);
  }

  /**
   * Delete course
   */
  async deleteCourse(id: string, userId: string): Promise<void> {
    const course = await this.courseRepo.findById(id);
    if (!course) {
      throw new NotFoundError("Course", id);
    }

    // Check permissions
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundError("User", userId);
    }

    if (user.role !== "ADMIN" && course.instructorId !== userId) {
      throw new AuthorizationError("You can only delete your own courses");
    }

    // Check if course has students enrolled
    const stats = await this.courseRepo.getStats(id);
    if (stats.studentsCount > 0) {
      throw new ValidationError("Cannot delete course with enrolled students");
    }

    await this.courseRepo.delete(id);
  }

  /**
   * Publish course
   */
  async publishCourse(id: string, userId: string): Promise<Course> {
    const course = await this.courseRepo.findById(id);
    if (!course) {
      throw new NotFoundError("Course", id);
    }

    // Check permissions
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundError("User", userId);
    }

    if (user.role !== "ADMIN" && course.instructorId !== userId) {
      throw new AuthorizationError("You can only publish your own courses");
    }

    if (course.isPublished) {
      throw new ValidationError("Course is already published");
    }

    // Validate course is ready for publishing
    await this.validateCourseForPublishing(id);

    return this.courseRepo.publish(id);
  }

  /**
   * Unpublish course
   */
  async unpublishCourse(id: string, userId: string): Promise<Course> {
    const course = await this.courseRepo.findById(id);
    if (!course) {
      throw new NotFoundError("Course", id);
    }

    // Check permissions
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundError("User", userId);
    }

    if (user.role !== "ADMIN" && course.instructorId !== userId) {
      throw new AuthorizationError("You can only unpublish your own courses");
    }

    if (!course.isPublished) {
      throw new ValidationError("Course is already unpublished");
    }

    return this.courseRepo.unpublish(id);
  }

  /**
   * Get featured courses
   */
  async getFeaturedCourses(limit: number = 6): Promise<readonly Course[]> {
    return this.courseRepo.getFeatured(limit);
  }

  /**
   * Get trending courses
   */
  async getTrendingCourses(limit: number = 6): Promise<readonly Course[]> {
    return this.courseRepo.getTrending(limit);
  }

  /**
   * Get related courses
   */
  async getRelatedCourses(
    courseId: string,
    limit: number = 4
  ): Promise<readonly Course[]> {
    return this.courseRepo.getRelated(courseId, limit);
  }

  /**
   * Check if user can access course
   */
  async canAccessCourse(courseId: string, userId: string): Promise<boolean> {
    return this.courseRepo.canAccess(courseId, userId);
  }

  /**
   * Validate course data
   */
  private validateCourseData(data: Partial<CreateCourseData>): void {
    const errors: string[] = [];

    if (data.title && data.title.trim().length < 5) {
      errors.push("Course title must be at least 5 characters long");
    }

    if (data.title && data.title.trim().length > 100) {
      errors.push("Course title must be less than 100 characters");
    }

    if (data.description && data.description.trim().length < 20) {
      errors.push("Course description must be at least 20 characters long");
    }

    if (data.description && data.description.trim().length > 2000) {
      errors.push("Course description must be less than 2000 characters");
    }

    if (data.price !== undefined && data.price < 0) {
      errors.push("Course price cannot be negative");
    }

    if (data.price !== undefined && data.price > 999999) {
      errors.push("Course price cannot exceed $999,999");
    }

    if (data.tags && data.tags.length > 10) {
      errors.push("Course cannot have more than 10 tags");
    }

    if (data.requirements && data.requirements.length > 20) {
      errors.push("Course cannot have more than 20 requirements");
    }

    if (data.learningObjectives && data.learningObjectives.length > 20) {
      errors.push("Course cannot have more than 20 learning objectives");
    }

    if (errors.length > 0) {
      throw new ValidationError("Course validation failed", { errors });
    }
  }

  /**
   * Validate course is ready for publishing
   */
  private async validateCourseForPublishing(courseId: string): Promise<void> {
    const course = await this.courseRepo.findById(courseId);
    if (!course) {
      throw new NotFoundError("Course not found");
    }

    const errors: string[] = [];

    // Check basic course information
    if (!course.title || course.title.trim().length < 3) {
      errors.push("Course title must be at least 3 characters long");
    }

    if (!course.description || course.description.trim().length < 50) {
      errors.push("Course description must be at least 50 characters long");
    }

    if (!course.thumbnail) {
      errors.push("Course must have a thumbnail image");
    }

    if (!course.price || course.price < 0) {
      errors.push("Course must have a valid price");
    }

    if (!course.category) {
      errors.push("Course must have a category");
    }

    // TODO: Add validation for course content
    // - Must have at least one module
    // - Must have at least 3 lessons
    // - Validate module content

    if (errors.length > 0) {
      throw new ValidationError("Course is not ready for publishing", {
        errors,
      });
    }
  }
}
