import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface Params {
  id: string;
}

interface QuizQuestionData {
  question: string;
  type: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER" | "ESSAY";
  points: number;
  options?: QuizOptionData[];
}

interface QuizOptionData {
  text: string;
  isCorrect: boolean;
}

interface CreateQuizData {
  title: string;
  description?: string;
  lessonId: string;
  timeLimit?: number;
  passingScore: number;
  questions: QuizQuestionData[];
}

// GET /api/courses/[id]/quizzes - Get all quizzes for a course
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const courseId = resolvedParams.id;

    const quizzes = await prisma.quiz.findMany({
      where: {
        lesson: {
          module: {
            courseId: courseId,
          },
        },
      },
      include: {
        questions: {
          include: {
            options: true,
          },
          orderBy: { order: "asc" },
        },
        lesson: {
          select: {
            id: true,
            title: true,
            module: {
              select: {
                title: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ success: true, data: quizzes });
  } catch (error) {
    console.error("Error fetching course quizzes:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/courses/[id]/quizzes - Create a new quiz for the course
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "INSTRUCTOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const courseId = resolvedParams.id;
    const data: CreateQuizData = await request.json();

    // Verify instructor owns the course
    const course = await prisma.course.findFirst({
      where: {
        id: courseId,
        instructorId: session.user.id,
      },
    });

    if (!course) {
      return NextResponse.json(
        { error: "Course not found or unauthorized" },
        { status: 404 }
      );
    }

    // Verify lesson belongs to this course
    const lesson = await prisma.lesson.findFirst({
      where: {
        id: data.lessonId,
        module: {
          courseId: courseId,
        },
      },
    });

    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    // Create quiz with questions
    const quiz = await prisma.quiz.create({
      data: {
        title: data.title,
        description: data.description || null,
        lessonId: data.lessonId,
        timeLimit: data.timeLimit || null,
        passingScore: data.passingScore,
        questions: {
          create: data.questions.map((q: QuizQuestionData, index: number) => ({
            question: q.question,
            type: q.type,
            points: q.points || 1,
            order: index + 1,
            options: {
              create:
                q.options?.map((opt: QuizOptionData, optIndex: number) => ({
                  text: opt.text,
                  isCorrect: opt.isCorrect,
                  order: optIndex + 1,
                })) || [],
            },
          })),
        },
      },
      include: {
        questions: {
          include: {
            options: true,
          },
          orderBy: { order: "asc" },
        },
      },
    });

    return NextResponse.json({ success: true, data: quiz });
  } catch (error) {
    console.error("Error creating quiz:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
