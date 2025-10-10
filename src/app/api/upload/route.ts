import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

// Maximum file sizes by category
const MAX_FILE_SIZES = {
  images: 10 * 1024 * 1024, // 10MB
  documents: 50 * 1024 * 1024, // 50MB
  videos: 500 * 1024 * 1024, // 500MB
  audio: 100 * 1024 * 1024, // 100MB
  general: 10 * 1024 * 1024, // 10MB
};

// Allowed file types by category
const ALLOWED_TYPES = {
  images: [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/svg+xml",
    "image/gif",
  ],
  documents: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ],
  videos: ["video/mp4", "video/webm", "video/quicktime", "video/avi"],
  audio: ["audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg"],
};

// Create general types array
const GENERAL_TYPES = [
  ...ALLOWED_TYPES.images,
  ...ALLOWED_TYPES.documents,
  ...ALLOWED_TYPES.audio,
];

function getFileCategory(mimeType: string): string {
  if (ALLOWED_TYPES.images.includes(mimeType)) return "images";
  if (ALLOWED_TYPES.videos.includes(mimeType)) return "videos";
  if (ALLOWED_TYPES.audio.includes(mimeType)) return "audio";
  if (ALLOWED_TYPES.documents.includes(mimeType)) return "documents";
  return "general";
}

function isAllowedFileType(mimeType: string, uploadType: string): boolean {
  if (uploadType === "course-content") {
    return GENERAL_TYPES.includes(mimeType);
  }

  const allowedTypes = ALLOWED_TYPES[uploadType as keyof typeof ALLOWED_TYPES];
  return Array.isArray(allowedTypes) && allowedTypes.includes(mimeType);
}

function getMaxFileSize(mimeType: string): number {
  const category = getFileCategory(mimeType);
  return (
    MAX_FILE_SIZES[category as keyof typeof MAX_FILE_SIZES] ||
    MAX_FILE_SIZES.general
  );
}

export async function POST(request: NextRequest) {
  try {
    console.log("Upload API called");

    const session = await getServerSession(authOptions);
    console.log("Session:", session?.user?.email);

    if (!session?.user) {
      console.log("No session found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = session.user as { role: string; id: string };
    console.log("User role:", user.role);

    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;
    const type: string = (data.get("type") as string) || "general";
    const courseId: string | null = data.get("courseId") as string;

    console.log("File:", file?.name, "Type:", type, "CourseId:", courseId);

    if (!file) {
      console.log("No file in request");
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Role-based access control
    if (
      (type === "logo" || type === "hero-background") &&
      user.role !== "ADMIN"
    ) {
      return NextResponse.json(
        { error: "Only admins can upload logos and hero backgrounds" },
        { status: 403 }
      );
    }

    if (
      (type === "course-content" || type === "course-thumbnail") &&
      user.role !== "INSTRUCTOR" &&
      user.role !== "ADMIN"
    ) {
      return NextResponse.json(
        { error: "Only instructors and admins can upload course content" },
        { status: 403 }
      );
    }

    // Validate file type based on upload type
    if (!isAllowedFileType(file.type, type)) {
      const category =
        type === "course-content"
          ? "documents, images, videos, or audio"
          : type;
      return NextResponse.json(
        { error: `Invalid file type for ${category}. File type: ${file.type}` },
        { status: 400 }
      );
    }

    // Validate file size based on file type
    const maxSize = getMaxFileSize(file.type);
    if (file.size > maxSize) {
      const maxSizeMB = Math.round(maxSize / (1024 * 1024));
      return NextResponse.json(
        {
          error: `File too large. Maximum size for this type is ${maxSizeMB}MB.`,
        },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // For course content and large files, save to filesystem
    if (type === "course-content" && courseId) {
      try {
        // Generate unique filename
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const fileExtension = file.name.split(".").pop();
        const fileName = `${timestamp}-${randomString}.${fileExtension}`;

        // Create upload directory
        const uploadDir = join(
          process.cwd(),
          "public",
          "uploads",
          "courses",
          courseId
        );
        if (!existsSync(uploadDir)) {
          await mkdir(uploadDir, { recursive: true });
        }

        // Save file
        const filePath = join(uploadDir, fileName);
        await writeFile(filePath, buffer);

        const publicUrl = `/uploads/courses/${courseId}/${fileName}`;
        const category = getFileCategory(file.type);

        console.log("Saved course content file:", publicUrl);

        return NextResponse.json({
          success: true,
          url: publicUrl,
          filename: file.name,
          savedAs: fileName,
          type: type,
          category: category,
          size: file.size,
          message: "Course content uploaded successfully",
        });
      } catch (fsError) {
        console.error("File system error:", fsError);
        // Fall back to base64 for deployment environments that don't support file system
      }
    }

    // For images and fallback, use base64 data URLs (for Vercel deployment compatibility)
    const base64 = buffer.toString("base64");
    const mimeType = file.type;
    const dataUrl = `data:${mimeType};base64,${base64}`;

    console.log("Created data URL for file:", file.name);

    return NextResponse.json({
      success: true,
      url: dataUrl,
      filename: file.name,
      type: type,
      category: getFileCategory(file.type),
      size: file.size,
      message: "File uploaded successfully as base64 data URL",
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}

// GET /api/upload - List uploaded files for a course
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");
    const fileType = searchParams.get("type");

    if (!courseId) {
      return NextResponse.json(
        { error: "Course ID required" },
        { status: 400 }
      );
    }

    // Check if user has access to this course
    const user = session.user as { role: string; id: string };
    if (user.role !== "ADMIN") {
      // TODO: Add database check to verify user owns/has access to this course
      // For now, only allow admins to list files
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // In a real implementation, you'd query the database for file metadata
    // For now, return mock data to demonstrate the structure
    const mockFiles = [
      {
        id: "1",
        filename: "Introduction to JavaScript.pdf",
        originalName: "Introduction to JavaScript.pdf",
        url: `/uploads/courses/${courseId}/intro-js.pdf`,
        type: "course-content",
        category: "documents",
        size: 2048576,
        uploadedAt: new Date().toISOString(),
        uploadedBy: user.id,
      },
      {
        id: "2",
        filename: "Course Overview Video.mp4",
        originalName: "Course Overview Video.mp4",
        url: `/uploads/courses/${courseId}/overview-video.mp4`,
        type: "course-content",
        category: "videos",
        size: 15728640,
        uploadedAt: new Date().toISOString(),
        uploadedBy: user.id,
      },
    ];

    const filteredFiles = fileType
      ? mockFiles.filter((file) => file.category === fileType)
      : mockFiles;

    return NextResponse.json({
      success: true,
      data: filteredFiles,
    });
  } catch (error) {
    console.error("Error listing files:", error);
    return NextResponse.json(
      { error: "Failed to list files" },
      { status: 500 }
    );
  }
}
