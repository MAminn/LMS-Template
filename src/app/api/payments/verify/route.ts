import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCheckoutSession } from "@/lib/stripe";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    // Get Stripe session details
    const stripeSession = await getCheckoutSession(sessionId);

    if (!stripeSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Get payment record
    const payment = await prisma.payment.findFirst({
      where: { stripeSessionId: sessionId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            description: true,
            thumbnail: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!payment) {
      return NextResponse.json({ error: "Payment not found" }, { status: 404 });
    }

    // Verify user owns this payment
    if (payment.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized access to payment" },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      payment: {
        id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        createdAt: payment.createdAt,
        course: payment.course,
      },
      stripeSession: {
        id: stripeSession.id,
        paymentStatus: stripeSession.payment_status,
        customerEmail: stripeSession.customer_email,
      },
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 }
    );
  }
}
