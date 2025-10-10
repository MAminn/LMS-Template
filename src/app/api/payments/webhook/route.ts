import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!stripe) {
      return NextResponse.json(
        { error: "Stripe not configured" },
        { status: 503 }
      );
    }

    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "No Stripe signature found" },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(
          event.data.object as Stripe.Checkout.Session
        );
        break;

      case "payment_intent.succeeded":
        await handlePaymentSucceeded(event.data.object as Stripe.PaymentIntent);
        break;

      case "payment_intent.payment_failed":
        await handlePaymentFailed(event.data.object as Stripe.PaymentIntent);
        break;

      case "invoice.payment_succeeded":
        await handleSubscriptionPayment(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  try {
    const payment = await prisma.payment.findFirst({
      where: { stripeSessionId: session.id },
      include: { course: true, user: true },
    });

    if (!payment) {
      console.error("Payment not found for session:", session.id);
      return;
    }

    // Update payment status
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "COMPLETED",
        stripePaymentId: session.payment_intent as string,
        metadata: {
          ...((payment.metadata as Record<string, unknown>) || {}),
          sessionCompleted: true,
          completedAt: new Date().toISOString(),
        },
      },
    });

    // Create enrollment if not exists
    const existingEnrollment = await prisma.enrollment.findFirst({
      where: {
        studentId: payment.userId,
        courseId: payment.courseId,
      },
    });

    if (!existingEnrollment) {
      await prisma.enrollment.create({
        data: {
          studentId: payment.userId,
          courseId: payment.courseId,
          progress: 0,
        },
      });
    }

    // Create transaction record
    await prisma.transaction.create({
      data: {
        type: "COURSE_PURCHASE",
        amount: payment.amount,
        currency: payment.currency,
        status: "COMPLETED",
        description: `Purchase of course: ${payment.course.title}`,
        userId: payment.userId,
        paymentId: payment.id,
        metadata: {
          courseId: payment.courseId,
          courseTitle: payment.course.title,
        },
      },
    });

    console.log(
      `Enrollment created for user ${payment.userId} in course ${payment.courseId}`
    );
  } catch (error) {
    console.error("Error handling checkout completion:", error);
  }
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log("Payment succeeded:", paymentIntent.id);
  // Additional payment success logic if needed
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  try {
    // Find and update payment status
    await prisma.payment.updateMany({
      where: { stripePaymentId: paymentIntent.id },
      data: { status: "FAILED" },
    });

    console.log("Payment failed:", paymentIntent.id);
  } catch (error) {
    console.error("Error handling payment failure:", error);
  }
}

async function handleSubscriptionPayment(invoice: Stripe.Invoice) {
  console.log("Subscription payment succeeded:", invoice.id);
  // Handle subscription payments if implemented
}
