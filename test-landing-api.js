// Test script for landing page API
const testAPI = async () => {
  try {
    console.log("Testing Landing Page API...");

    // Test GET endpoint
    const getResponse = await fetch(
      "http://localhost:3000/api/templates/landing"
    );
    const getData = await getResponse.json();

    console.log("GET /api/templates/landing:", getResponse.status);
    console.log("Success:", getData.success);

    if (getData.success) {
      console.log("✅ API is working correctly!");
      console.log("Hero Title:", getData.data.content.heroTitle);
      console.log("Features Count:", getData.data.features.length);
    } else {
      console.log("❌ API returned error:", getData.error);
    }
  } catch (error) {
    console.error("❌ API Test Failed:", error.message);
  }
};

testAPI();
