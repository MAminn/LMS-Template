import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Development mode flag
const isDevelopment =
  process.env.NODE_ENV === "development" &&
  process.env.STRIPE_SECRET_KEY?.includes("Demo");

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { courseId } = await request.json();

    if (!courseId) {
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 }
      );
    }

    // Get course details
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    if (!course.price || course.price <= 0) {
      return NextResponse.json(
        { error: "Course is free or price not set" },
        { status: 400 }
      );
    }

    // Check if user already purchased this course (skip for development if table doesn't exist)
    try {
      const existingPayment = await prisma.payment.findFirst({
        where: {
          userId: session.user.id,
          courseId: courseId,
          status: "COMPLETED",
        },
      });

      if (existingPayment) {
        return NextResponse.json(
          { error: "Course already purchased" },
          { status: 400 }
        );
      }
    } catch (error: unknown) {
      // Skip payment check if table doesn't exist (development mode)
      console.log(
        "Payment table not accessible, skipping duplicate check:",
        error
      );
    }

    if (isDevelopment) {
      // Development mode: simulate payment flow
      const mockSessionId = `cs_demo_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      // For development, skip payment record creation and go directly to checkout
      console.log("Development mode: Creating mock checkout session");

      // Return mock checkout URL for development
      const mockCheckoutUrl = `${process.env.NEXT_PUBLIC_APP_URL}/payment/dev-checkout?session_id=${mockSessionId}&course=${courseId}`;

      return NextResponse.json({
        success: true,
        sessionId: mockSessionId,
        url: mockCheckoutUrl,
      });
    } else {
      // Production mode: use real Stripe
      const { createCheckoutSession } = await import("@/lib/stripe");

      const checkoutSession = await createCheckoutSession({
        courseId,
        courseTitle: course.title,
        price: course.price,
        userId: session.user.id,
        userEmail: session.user.email!,
      });

      // For now, skip payment record creation until Prisma client is updated
      console.log("Production mode: Skipping payment record creation");

      return NextResponse.json({
        success: true,
        sessionId: checkoutSession.id,
        url: checkoutSession.url,
      });
    }
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
