import Stripe from "stripe";

// Make Stripe optional for deployment without Stripe credentials
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

export const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: "2025-09-30.clover",
      typescript: true,
    })
  : null;

export const getStripePublicKey = () => {
  const publicKey = process.env.STRIPE_PUBLIC_KEY;
  if (!publicKey) {
    console.warn("STRIPE_PUBLIC_KEY is not defined - Stripe features disabled");
    return null;
  }
  return publicKey;
};

/**
 * Create a Stripe Checkout session for course purchase
 */
export async function createCheckoutSession({
  courseId,
  courseTitle,
  price,
  userId,
  userEmail,
}: {
  courseId: string;
  courseTitle: string;
  price: number;
  userId: string;
  userEmail: string;
}) {
  if (!stripe) {
    throw new Error(
      "Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable."
    );
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: process.env.CURRENCY || "usd",
          product_data: {
            name: courseTitle,
            description: `Access to the complete ${courseTitle} course`,
          },
          unit_amount: Math.round(price * 100), // Convert to cents
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${process.env.PAYMENT_SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url:
      process.env.PAYMENT_CANCEL_URL ||
      `${process.env.NEXT_PUBLIC_APP_URL}/courses`,
    customer_email: userEmail,
    metadata: {
      courseId,
      userId,
    },
  });

  return session;
}

/**
 * Retrieve a checkout session
 */
export async function getCheckoutSession(sessionId: string) {
  if (!stripe) {
    throw new Error(
      "Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable."
    );
  }
  return await stripe.checkout.sessions.retrieve(sessionId);
}

/**
 * Create a subscription for premium features
 */
export async function createSubscription({
  userId,
  userEmail,
  priceId,
}: {
  userId: string;
  userEmail: string;
  priceId: string;
}) {
  if (!stripe) {
    throw new Error(
      "Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable."
    );
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: "subscription",
    success_url: `${process.env.PAYMENT_SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url:
      process.env.PAYMENT_CANCEL_URL ||
      `${process.env.NEXT_PUBLIC_APP_URL}/courses`,
    customer_email: userEmail,
    metadata: {
      userId,
    },
  });

  return session;
}
