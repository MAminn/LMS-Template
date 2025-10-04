async function testAPIEndpoints() {
  console.log("🔧 TESTING LEARNING API ENDPOINTS");
  console.log("=".repeat(50));

  const baseUrl = "http://localhost:3000";
  const courseId = "cmg8yyrgy0001uu54cgnx67ua"; // JavaScript Fundamentals

  try {
    // Test without authentication (should fail)
    console.log("\n1. Testing unauthorized access...");

    try {
      const response = await fetch(
        `${baseUrl}/api/courses/${courseId}/modules`
      );
      console.log(
        `   Modules API (unauthorized): ${response.status} - ${
          response.status === 401 ? "✅ Properly secured" : "❌ Security issue"
        }`
      );
    } catch (error) {
      console.log(`   ❌ Network error: ${error.message}`);
    }

    try {
      const response = await fetch(
        `${baseUrl}/api/courses/${courseId}/progress`
      );
      console.log(
        `   Progress API (unauthorized): ${response.status} - ${
          response.status === 401 ? "✅ Properly secured" : "❌ Security issue"
        }`
      );
    } catch (error) {
      console.log(`   ❌ Network error: ${error.message}`);
    }

    console.log("\n✅ API SECURITY TEST COMPLETE!");
    console.log("\n📋 API ENDPOINTS AVAILABLE:");
    console.log(
      `   GET /api/courses/${courseId}/modules - Get course modules and lessons`
    );
    console.log(
      `   GET /api/courses/${courseId}/progress - Get user's lesson progress`
    );
    console.log(
      `   POST /api/lessons/[lessonId]/complete - Mark lesson as complete`
    );
    console.log(`   GET /api/courses/${courseId} - Get course details`);
  } catch (error) {
    console.error("❌ Error testing API endpoints:", error);
  }
}

testAPIEndpoints();
