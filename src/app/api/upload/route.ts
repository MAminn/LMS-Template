import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin for logo uploads
    const user = session.user as { role: string; id: string };

    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;
    const type: string = (data.get("type") as string) || "general";

    if (!file) {
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
      type === "course" &&
      user.role !== "INSTRUCTOR" &&
      user.role !== "ADMIN"
    ) {
      return NextResponse.json(
        { error: "Only instructors and admins can upload course images" },
        { status: 403 }
      );
    }

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/svg+xml",
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            "Invalid file type. Only JPEG, PNG, WebP, and SVG images are allowed.",
        },
        { status: 400 }
      );
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 10MB." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename based on type
    const timestamp = Date.now();
    const fileExtension = file.name.split(".").pop();
    const filename = `${type}-${user.id}-${timestamp}.${fileExtension}`;

    // Determine upload directory based on type
    let uploadSubDir = "general";
    switch (type) {
      case "logo":
      case "hero-background":
        uploadSubDir = "branding";
        break;
      case "course":
        uploadSubDir = "courses";
        break;
      case "avatar":
        uploadSubDir = "avatars";
        break;
      default:
        uploadSubDir = "general";
    }

    const uploadDir = join(process.cwd(), "public", "uploads", uploadSubDir);

    // Create directory if it doesn't exist
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const filePath = join(uploadDir, filename);
    await writeFile(filePath, buffer);

    // Return the public URL
    const fileUrl = `/uploads/${uploadSubDir}/${filename}`;

    return NextResponse.json({
      success: true,
      url: fileUrl,
      filename: filename,
      type: type,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
