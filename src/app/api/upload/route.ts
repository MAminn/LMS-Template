import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    console.log("Upload API called");
    
    const session = await getServerSession(authOptions);
    console.log("Session:", session?.user?.email);
    
    if (!session?.user) {
      console.log("No session found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin for logo uploads
    const user = session.user as { role: string; id: string };
    console.log("User role:", user.role);

    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;
    const type: string = (data.get("type") as string) || "general";
    
    console.log("File:", file?.name, "Type:", type);

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

    // For Vercel deployment, we'll store images as base64 data URLs
    // This is a simple solution for MVP - in production, use cloud storage
    const base64 = buffer.toString('base64');
    const mimeType = file.type;
    const dataUrl = `data:${mimeType};base64,${base64}`;

    console.log("Created data URL for file:", file.name);

    // Return the data URL instead of file path
    return NextResponse.json({
      success: true,
      url: dataUrl,
      filename: file.name,
      type: type,
      message: "File uploaded successfully as base64 data URL"
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
