import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { z } from "zod";

// In a real app, these would be database models
interface UserProgress {
  userId: string;
  courseId: string;
  completedLessons: string[];
  totalLessons: number;
  completionPercentage: number;
  timeSpent: number; // in minutes
  lastAccessed: string;
  certificateEarned: boolean;
  currentStreak: number;
  achievements: Achievement[];
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string;
  category: "completion" | "streak" | "engagement" | "skill";
}

interface LearningPath {
  id: string;
  name: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedHours: number;
  courses: CourseInPath[];
  tags: string[];
  createdAt: string;
}

interface CourseInPath {
  courseId: string;
  title: string;
  order: number;
  isCompleted: boolean;
  prerequisiteFor: string[];
}

interface UserPreferences {
  userId: string;
  learningGoals: string[];
  preferredDifficulty: "beginner" | "intermediate" | "advanced";
  dailyLearningTime: number; // in minutes
  reminderSettings: {
    enabled: boolean;
    time: string;
    frequency: "daily" | "weekly";
  };
  interestAreas: string[];
  accessibility: {
    reducedMotion: boolean;
    highContrast: boolean;
    fontSize: "small" | "medium" | "large";
  };
}

// Mock data for development
const mockUserProgress: UserProgress[] = [
  {
    userId: "user1",
    courseId: "course1",
    completedLessons: ["lesson1", "lesson2", "lesson3"],
    totalLessons: 10,
    completionPercentage: 30,
    timeSpent: 180,
    lastAccessed: new Date().toISOString(),
    certificateEarned: false,
    currentStreak: 5,
    achievements: [
      {
        id: "ach1",
        name: "First Steps",
        description: "Complete your first lesson",
        icon: "🎯",
        unlockedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        category: "completion",
      },
      {
        id: "ach2",
        name: "Consistent Learner",
        description: "Maintain a 5-day learning streak",
        icon: "🔥",
        unlockedAt: new Date().toISOString(),
        category: "streak",
      },
    ],
  },
];

const mockLearningPaths: LearningPath[] = [
  {
    id: "path1",
    name: "Full Stack Web Development",
    description: "Complete journey from beginner to full stack developer",
    difficulty: "beginner",
    estimatedHours: 120,
    courses: [
      {
        courseId: "course1",
        title: "HTML & CSS Fundamentals",
        order: 1,
        isCompleted: true,
        prerequisiteFor: ["course2"],
      },
      {
        courseId: "course2",
        title: "JavaScript Essentials",
        order: 2,
        isCompleted: false,
        prerequisiteFor: ["course3", "course4"],
      },
      {
        courseId: "course3",
        title: "React.js Development",
        order: 3,
        isCompleted: false,
        prerequisiteFor: ["course5"],
      },
    ],
    tags: ["web-development", "javascript", "react", "full-stack"],
    createdAt: new Date().toISOString(),
  },
];

const mockUserPreferences: UserPreferences[] = [
  {
    userId: "user1",
    learningGoals: ["career-change", "skill-improvement"],
    preferredDifficulty: "intermediate",
    dailyLearningTime: 60,
    reminderSettings: {
      enabled: true,
      time: "18:00",
      frequency: "daily",
    },
    interestAreas: ["web-development", "data-science", "mobile-development"],
    accessibility: {
      reducedMotion: false,
      highContrast: false,
      fontSize: "medium",
    },
  },
];

const updateProgressSchema = z.object({
  courseId: z.string().min(1),
  lessonId: z.string().min(1),
  timeSpent: z.number().min(0).optional(),
  completed: z.boolean(),
});

const updatePreferencesSchema = z.object({
  learningGoals: z.array(z.string()).optional(),
  preferredDifficulty: z
    .enum(["beginner", "intermediate", "advanced"])
    .optional(),
  dailyLearningTime: z.number().min(5).max(480).optional(), // 5 min to 8 hours
  reminderSettings: z
    .object({
      enabled: z.boolean(),
      time: z.string(),
      frequency: z.enum(["daily", "weekly"]),
    })
    .optional(),
  interestAreas: z.array(z.string()).optional(),
  accessibility: z
    .object({
      reducedMotion: z.boolean(),
      highContrast: z.boolean(),
      fontSize: z.enum(["small", "medium", "large"]),
    })
    .optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const courseId = searchParams.get("courseId");

    switch (type) {
      case "progress":
        if (courseId) {
          const courseProgress = mockUserProgress.find(
            (p) => p.userId === session.user.id && p.courseId === courseId
          );
          return NextResponse.json({
            success: true,
            data: courseProgress || {
              userId: session.user.id,
              courseId,
              completedLessons: [],
              totalLessons: 0,
              completionPercentage: 0,
              timeSpent: 0,
              lastAccessed: new Date().toISOString(),
              certificateEarned: false,
              currentStreak: 0,
              achievements: [],
            },
          });
        } else {
          // Get all user progress
          const userProgress = mockUserProgress.filter(
            (p) => p.userId === session.user.id
          );
          return NextResponse.json({
            success: true,
            data: userProgress,
          });
        }

      case "achievements":
        const userProgress = mockUserProgress.find(
          (p) => p.userId === session.user.id
        );
        const allAchievements = userProgress?.achievements || [];

        // Add available achievements not yet unlocked
        const availableAchievements = [
          {
            id: "ach3",
            name: "Course Completionist",
            description: "Complete your first course",
            icon: "🏆",
            unlockedAt: null,
            category: "completion" as const,
          },
          {
            id: "ach4",
            name: "Learning Streak Master",
            description: "Maintain a 30-day learning streak",
            icon: "🔥",
            unlockedAt: null,
            category: "streak" as const,
          },
        ];

        return NextResponse.json({
          success: true,
          data: {
            earned: allAchievements,
            available: availableAchievements.filter(
              (ach) => !allAchievements.some((earned) => earned.id === ach.id)
            ),
          },
        });

      case "learning-paths":
        return NextResponse.json({
          success: true,
          data: mockLearningPaths,
        });

      case "recommendations":
        // Simple recommendation logic based on user interests
        const userPrefs = mockUserPreferences.find(
          (p) => p.userId === session.user.id
        );
        const interests = userPrefs?.interestAreas || [];

        const recommendations = mockLearningPaths.filter((path) =>
          path.tags.some((tag) => interests.includes(tag))
        );

        return NextResponse.json({
          success: true,
          data: {
            learningPaths: recommendations,
            reason:
              interests.length > 0
                ? "Based on your interests"
                : "Popular paths",
          },
        });

      case "preferences":
        const preferences = mockUserPreferences.find(
          (p) => p.userId === session.user.id
        );
        return NextResponse.json({
          success: true,
          data: preferences || {
            userId: session.user.id,
            learningGoals: [],
            preferredDifficulty: "beginner",
            dailyLearningTime: 30,
            reminderSettings: {
              enabled: false,
              time: "18:00",
              frequency: "daily",
            },
            interestAreas: [],
            accessibility: {
              reducedMotion: false,
              highContrast: false,
              fontSize: "medium",
            },
          },
        });

      case "analytics":
        // Get user learning analytics
        const analyticsData = {
          totalTimeSpent: mockUserProgress
            .filter((p) => p.userId === session.user.id)
            .reduce((sum, p) => sum + p.timeSpent, 0),
          coursesCompleted: mockUserProgress.filter(
            (p) =>
              p.userId === session.user.id && p.completionPercentage === 100
          ).length,
          currentStreak: Math.max(
            ...mockUserProgress
              .filter((p) => p.userId === session.user.id)
              .map((p) => p.currentStreak),
            0
          ),
          achievementsEarned: mockUserProgress
            .filter((p) => p.userId === session.user.id)
            .reduce((sum, p) => sum + p.achievements.length, 0),
          weeklyProgress: [
            { date: "Mon", minutes: 45 },
            { date: "Tue", minutes: 60 },
            { date: "Wed", minutes: 30 },
            { date: "Thu", minutes: 75 },
            { date: "Fri", minutes: 90 },
            { date: "Sat", minutes: 40 },
            { date: "Sun", minutes: 55 },
          ],
        };

        return NextResponse.json({
          success: true,
          data: analyticsData,
        });

      default:
        return NextResponse.json(
          {
            error: "Invalid type parameter",
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    return NextResponse.json(
      { error: "Failed to fetch user data" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    switch (type) {
      case "progress":
        const progressData = updateProgressSchema.parse(body);

        // Update user progress
        const existingProgressIndex = mockUserProgress.findIndex(
          (p) =>
            p.userId === session.user.id && p.courseId === progressData.courseId
        );

        if (existingProgressIndex >= 0) {
          const existing = mockUserProgress[existingProgressIndex];
          if (existing) {
            if (
              progressData.completed &&
              !existing.completedLessons.includes(progressData.lessonId)
            ) {
              existing.completedLessons.push(progressData.lessonId);
              existing.completionPercentage = Math.round(
                (existing.completedLessons.length / existing.totalLessons) * 100
              );
            }
            if (progressData.timeSpent) {
              existing.timeSpent += progressData.timeSpent;
            }
            existing.lastAccessed = new Date().toISOString();
          }
        } else {
          // Create new progress record
          const newProgress: UserProgress = {
            userId: session.user.id,
            courseId: progressData.courseId,
            completedLessons: progressData.completed
              ? [progressData.lessonId]
              : [],
            totalLessons: 10, // Mock value
            completionPercentage: progressData.completed ? 10 : 0,
            timeSpent: progressData.timeSpent || 0,
            lastAccessed: new Date().toISOString(),
            certificateEarned: false,
            currentStreak: 1,
            achievements: [],
          };
          mockUserProgress.push(newProgress);
        }

        return NextResponse.json({
          success: true,
          message: "Progress updated successfully",
        });

      default:
        return NextResponse.json(
          {
            error: "Invalid type parameter",
          },
          { status: 400 }
        );
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error updating user data:", error);
    return NextResponse.json(
      { error: "Failed to update user data" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    switch (type) {
      case "preferences":
        const preferencesData = updatePreferencesSchema.parse(body);

        const existingPrefIndex = mockUserPreferences.findIndex(
          (p) => p.userId === session.user.id
        );

        if (existingPrefIndex >= 0) {
          // Update existing preferences
          const existingPrefs = mockUserPreferences[existingPrefIndex];
          if (existingPrefs) {
            Object.assign(existingPrefs, preferencesData);
          }
        } else {
          // Create new preferences
          const newPreferences: UserPreferences = {
            userId: session.user.id,
            learningGoals: preferencesData.learningGoals || [],
            preferredDifficulty:
              preferencesData.preferredDifficulty || "beginner",
            dailyLearningTime: preferencesData.dailyLearningTime || 30,
            reminderSettings: preferencesData.reminderSettings || {
              enabled: false,
              time: "18:00",
              frequency: "daily",
            },
            interestAreas: preferencesData.interestAreas || [],
            accessibility: preferencesData.accessibility || {
              reducedMotion: false,
              highContrast: false,
              fontSize: "medium",
            },
          };
          mockUserPreferences.push(newPreferences);
        }

        return NextResponse.json({
          success: true,
          message: "Preferences updated successfully",
        });

      default:
        return NextResponse.json(
          {
            error: "Invalid type parameter",
          },
          { status: 400 }
        );
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error updating user preferences:", error);
    return NextResponse.json(
      { error: "Failed to update user preferences" },
      { status: 500 }
    );
  }
}
