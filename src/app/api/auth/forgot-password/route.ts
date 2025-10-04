import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({
        success: true,
        message:
          "If an account with that email exists, we've sent a password reset link.",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Save reset token to database (we'll need to add this to the schema)
    // For now, we'll simulate sending an email
    console.log(`Password reset token for ${email}: ${resetToken}`);
    console.log(
      `Reset URL: ${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`
    );

    // In production, you would:
    // 1. Save the token to the database with expiry (1 hour from now)
    // 2. Send an email with the reset link
    // 3. Set an expiration time

    return NextResponse.json({
      success: true,
      message:
        "If an account with that email exists, we've sent a password reset link.",
      // For demo purposes only - remove in production
      resetUrl: `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`,
    });
  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
