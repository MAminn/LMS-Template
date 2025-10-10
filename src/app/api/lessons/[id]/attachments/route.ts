import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

interface Params {
  id: string;
}

// POST /api/lessons/[id]/attachments - Upload attachment for lesson
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
    const lessonId = resolvedParams.id;

    // Verify instructor owns the lesson
    const lesson = await prisma.lesson.findFirst({
      where: {
        id: lessonId,
        module: {
          course: {
            instructorId: session.user.id,
          },
        },
      },
    });

    if (!lesson) {
      return NextResponse.json(
        { error: "Lesson not found or unauthorized" },
        { status: 404 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const isRequired = formData.get("isRequired") === "true";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // File size limit: 50MB for documents, 500MB for videos
    const maxSize = file.type.startsWith("video/") ? 500 * 1024 * 1024 : 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File too large. Maximum size: ${maxSize / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    // Create upload directory
    const uploadDir = path.join(process.cwd(), "public", "uploads", "attachments");
    await mkdir(uploadDir, { recursive: true });

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedTitle = title.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
    const extension = path.extname(file.name);
    const fileName = `${timestamp}_${sanitizedTitle}${extension}`;
    const filePath = path.join(uploadDir, fileName);

    // Write file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Get next order
    const lastAttachment = await prisma.lessonAttachment.findFirst({
      where: { lessonId },
      orderBy: { order: "desc" },
    });
    const nextOrder = lastAttachment ? lastAttachment.order + 1 : 1;

    // Save to database
    const attachment = await prisma.lessonAttachment.create({
      data: {
        lessonId,
        title,
        description,
        fileUrl: `/uploads/attachments/${fileName}`,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        isRequired,
        order: nextOrder,
      },
    });

    return NextResponse.json(attachment, { status: 201 });
  } catch (error) {
    console.error("Error uploading attachment:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET /api/lessons/[id]/attachments - Get lesson attachments
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const lessonId = resolvedParams.id;

    const attachments = await prisma.lessonAttachment.findMany({
      where: { lessonId },
      orderBy: { order: "asc" },
    });

    return NextResponse.json(attachments);
  } catch (error) {
    console.error("Error fetching attachments:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}