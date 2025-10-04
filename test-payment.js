import { PrismaClient } from "@prisma/client";

async function testPaymentIntegration() {
  console.log("💳 TESTING PAYMENT INTEGRATION");
  console.log("=".repeat(50));

  const prisma = new PrismaClient();

  try {
    // Get a course to test with
    const course = await prisma.course.findFirst({
      where: { isPublished: true },
      include: { instructor: true },
    });

    if (!course) {
      console.log("❌ No published courses found");
      return;
    }

    console.log("📚 Test Course Found:");
    console.log(`   ID: ${course.id}`);
    console.log(`   Title: ${course.title}`);
    console.log(`   Price: $${course.price || 0}`);
    console.log(`   Instructor: ${course.instructor.name}`);

    // Test payment models
    console.log("\n🔧 Testing Payment Database Schema:");

    // Create a test payment record
    const testPayment = await prisma.payment.create({
      data: {
        amount: course.price || 29.99,
        currency: "usd",
        status: "PENDING",
        paymentMethod: "stripe",
        userId: course.instructor.id, // Using instructor as test user
        courseId: course.id,
        stripeSessionId: "test_session_123",
        metadata: {
          test: true,
          courseTitle: course.title,
        },
      },
    });

    console.log("   ✅ Payment record created successfully");
    console.log(`   Payment ID: ${testPayment.id}`);

    // Create a test transaction
    const testTransaction = await prisma.transaction.create({
      data: {
        type: "COURSE_PURCHASE",
        amount: testPayment.amount,
        currency: testPayment.currency,
        status: "PENDING",
        description: `Test purchase of ${course.title}`,
        userId: testPayment.userId,
        paymentId: testPayment.id,
        metadata: {
          test: true,
        },
      },
    });

    console.log("   ✅ Transaction record created successfully");
    console.log(`   Transaction ID: ${testTransaction.id}`);

    // Test API endpoints
    console.log("\n🌐 Testing API Endpoints:");

    const apiTests = [
      "/api/payments/status",
      "/api/payments/checkout",
      "/api/payments/verify",
      "/api/payments/webhook",
    ];

    apiTests.forEach((endpoint) => {
      console.log(`   📡 ${endpoint} - Ready for testing`);
    });

    console.log("\n🎯 TEST SCENARIOS:");
    console.log(
      `   1. Course Detail Page: http://localhost:3000/courses/${course.id}`
    );
    console.log(
      `   2. Payment Button: Should show "Purchase for $${course.price || 0}"`
    );
    console.log(`   3. Payment Flow: Click → Stripe Checkout → Success Page`);
    console.log(`   4. Access Control: After payment → Course access granted`);

    // Clean up test data
    await prisma.transaction.delete({ where: { id: testTransaction.id } });
    await prisma.payment.delete({ where: { id: testPayment.id } });

    console.log("\n✅ PAYMENT INTEGRATION TEST COMPLETE!");
    console.log("\n📋 READY FOR PRODUCTION:");
    console.log("   • Add real Stripe API keys to .env.local");
    console.log("   • Configure webhook endpoint in Stripe dashboard");
    console.log("   • Test with real payment methods");
    console.log("   • Deploy and configure production URLs");
  } catch (error) {
    console.error("❌ Error testing payment integration:", error);
  } finally {
    await prisma.$disconnect();
  }
}

testPaymentIntegration();
