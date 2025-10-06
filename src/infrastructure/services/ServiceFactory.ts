/**
 * Service Factory
 *
 * This module provides a factory for creating service instances
 * with their dependencies injected.
 */

import { CourseService } from "@/domains/courses/service";
import { UserService } from "@/domains/users/service";
import { ContentService } from "@/domains/content/service";
import { ProgressService } from "@/domains/progress/service";
import { BrandingService } from "@/domains/branding/service";

import { PrismaCourseRepository } from "@/infrastructure/repositories/PrismaCourseRepository";
import { PrismaUserRepository } from "@/infrastructure/repositories/PrismaUserRepository";
import {
  PrismaModuleRepository,
  PrismaLessonRepository,
} from "@/infrastructure/repositories/PrismaContentRepository";
import { PrismaProgressRepository } from "@/infrastructure/repositories/PrismaProgressRepository";
import { PrismaBrandingRepository } from "@/infrastructure/repositories/PrismaBrandingRepository";

/**
 * Create service instances with injected dependencies
 */
export const createServices = () => {
  // Repository instances
  const courseRepository = new PrismaCourseRepository();
  const userRepository = new PrismaUserRepository();
  const moduleRepository = new PrismaModuleRepository();
  const lessonRepository = new PrismaLessonRepository();
  const progressRepository = new PrismaProgressRepository();
  const brandingRepository = new PrismaBrandingRepository();

  // Service instances with injected repositories
  const courseService = new CourseService(courseRepository, userRepository);
  const userService = new UserService(userRepository);
  const contentService = new ContentService(
    moduleRepository,
    lessonRepository,
    userRepository
  );
  const progressService = new ProgressService(
    progressRepository,
    userRepository
  );
  const brandingService = new BrandingService(
    brandingRepository,
    userRepository
  );

  return {
    // Repositories
    courseRepository,
    userRepository,
    moduleRepository,
    lessonRepository,
    progressRepository,
    brandingRepository,

    // Services
    courseService,
    userService,
    contentService,
    progressService,
    brandingService,
  };
};

/**
 * Service container type
 */
export type ServiceContainer = ReturnType<typeof createServices>;

/**
 * Singleton service container
 */
let serviceContainer: ServiceContainer | null = null;

/**
 * Get the service container (singleton)
 */
export const getServices = (): ServiceContainer => {
  if (!serviceContainer) {
    serviceContainer = createServices();
  }
  return serviceContainer;
};
