import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface Params {
  id: string;
}

interface QuizAnswerData {
  questionId: string;
  selectedText?: string;
}

interface SubmitQuizData {
  answers: QuizAnswerData[];
  timeSpent: number; // in seconds
}

// POST /api/quizzes/[id]/attempt - Submit a quiz attempt
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const quizId = resolvedParams.id;
    const data: SubmitQuizData = await request.json();

    // Get quiz with questions and correct answers
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          include: {
            options: true,
          },
          orderBy: { order: "asc" },
        },
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // Calculate score
    let totalPoints = 0;
    let earnedPoints = 0;

    const answersWithScoring = data.answers.map((answer) => {
      const question = quiz.questions.find(
        (q: { id: string }) => q.id === answer.questionId
      );
      if (!question) return { ...answer, isCorrect: false, points: 0 };

      totalPoints += question.points;

      let isCorrect = false;

      if (
        question.type === "MULTIPLE_CHOICE" ||
        question.type === "TRUE_FALSE"
      ) {
        const correctOption = question.options.find(
          (opt: { isCorrect: boolean }) => opt.isCorrect
        );
        isCorrect = correctOption?.text === answer.selectedText;
      } else if (question.type === "SHORT_ANSWER") {
        // Simple text matching - in production you might want more sophisticated matching
        const correctOption = question.options.find(
          (opt: { isCorrect: boolean }) => opt.isCorrect
        );
        isCorrect =
          correctOption?.text.toLowerCase().trim() ===
          answer.selectedText?.toLowerCase().trim();
      }

      if (isCorrect) {
        earnedPoints += question.points;
      }

      return {
        ...answer,
        isCorrect,
        points: isCorrect ? question.points : 0,
      };
    });

    const score =
      totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    const passed = score >= quiz.passingScore;

    // Create quiz attempt
    const attempt = await prisma.quizAttempt.create({
      data: {
        studentId: session.user.id,
        quizId: quizId,
        score: score,
        timeSpent: data.timeSpent,
        completedAt: new Date(),
        passed: passed,
        answers: {
          create: answersWithScoring.map((answer) => ({
            questionId: answer.questionId,
            selectedText: answer.selectedText || "",
            isCorrect: answer.isCorrect,
            points: answer.points,
          })),
        },
      },
      include: {
        answers: {
          include: {
            question: {
              include: {
                options: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        attempt,
        score,
        passed,
        totalQuestions: quiz.questions.length,
        correctAnswers: answersWithScoring.filter((a) => a.isCorrect).length,
      },
    });
  } catch (error) {
    console.error("Error submitting quiz attempt:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET /api/quizzes/[id]/attempt - Get user's attempts for this quiz
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
    const quizId = resolvedParams.id;

    const attempts = await prisma.quizAttempt.findMany({
      where: {
        quizId: quizId,
        studentId: session.user.id,
      },
      include: {
        answers: true,
      },
      orderBy: { startedAt: "desc" },
    });

    return NextResponse.json({ success: true, data: attempts });
  } catch (error) {
    console.error("Error fetching quiz attempts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
