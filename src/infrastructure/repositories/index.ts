/**
 * Prisma Repository Implementations
 *
 * This module exports all Prisma-based repository implementations
 * that can be used with dependency injection in the service layer.
 */

export { PrismaCourseRepository } from "./PrismaCourseRepository";
export { PrismaUserRepository } from "./PrismaUserRepository";
export {
  PrismaModuleRepository,
  PrismaLessonRepository,
} from "./PrismaContentRepository";
export { PrismaProgressRepository } from "./PrismaProgressRepository";

/**
 * Repository factory functions for dependency injection
 */
export const createRepositories = () => ({
  courseRepository: new PrismaCourseRepository(),
  userRepository: new PrismaUserRepository(),
  moduleRepository: new PrismaModuleRepository(),
  lessonRepository: new PrismaLessonRepository(),
  progressRepository: new PrismaProgressRepository(),
});

/**
 * Repository type definitions for dependency injection
 */
export type Repositories = ReturnType<typeof createRepositories>;
