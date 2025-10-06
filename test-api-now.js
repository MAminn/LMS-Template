// Test the landing page API
const testAPI = async () => {
  try {
    console.log("Testing GET endpoint...");
    const getResponse = await fetch(
      "http://localhost:3000/api/templates/landing"
    );
    const getResult = await getResponse.text();
    console.log("GET Status:", getResponse.status);
    console.log("GET Response:", getResult);

    if (getResponse.status === 200) {
      console.log("✅ GET endpoint working!");
    } else {
      console.log("❌ GET endpoint failed");
    }
  } catch (error) {
    console.error("Error testing API:", error);
  }
};

testAPI();
