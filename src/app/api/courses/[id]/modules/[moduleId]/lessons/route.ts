import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface Params {
  id: string;
  moduleId: string;
}

interface CreateLessonData {
  title: string;
  description?: string;
  content?: string;
  videoUrl?: string;
  videoFileUrl?: string;
  thumbnailUrl?: string;
  duration?: string;
  isPreview?: boolean;
  isFree?: boolean;
  prerequisites?: string[];
  scheduledAt?: string;
  interactiveData?: Record<string, unknown>;
}

// POST /api/courses/[id]/modules/[moduleId]/lessons - Create a new lesson
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
    const { id: courseId, moduleId } = resolvedParams;
    const data: CreateLessonData = await request.json();

    // Verify instructor owns the course and module exists
    const moduleData = await prisma.module.findFirst({
      where: {
        id: moduleId,
        course: {
          id: courseId,
          instructorId: session.user.id,
        },
      },
    });

    if (!moduleData) {
      return NextResponse.json(
        { error: "Module not found or unauthorized" },
        { status: 404 }
      );
    }

    // Get the next order number for lessons in this module
    const lastLesson = await prisma.lesson.findFirst({
      where: { moduleId },
      orderBy: { order: "desc" },
    });

    const nextOrder = lastLesson ? lastLesson.order + 1 : 1;

    // Parse duration if provided
    const duration = data.duration ? parseInt(data.duration) : null;

    // Parse scheduled date if provided
    const scheduledAt = data.scheduledAt ? new Date(data.scheduledAt) : null;

    // Create the lesson
    const lesson = await prisma.lesson.create({
      data: {
        title: data.title,
        description: data.description,
        content: data.content,
        videoUrl: data.videoUrl,
        videoFileUrl: data.videoFileUrl,
        thumbnailUrl: data.thumbnailUrl,
        duration,
        order: nextOrder,
        moduleId: moduleId,
        isPreview: data.isPreview || false,
        isFree: data.isFree || false,
        prerequisites: data.prerequisites || [],
        scheduledAt,
        interactiveData: data.interactiveData || null,
      },
      include: {
        attachments: true,
      },
    });

    return NextResponse.json(lesson, { status: 201 });
  } catch (error) {
    console.error("Error creating lesson:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}