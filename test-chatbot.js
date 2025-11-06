/*
Chatbot Functionality Test Script
Tests all major chatbot features to ensure full functionality
*/

const testQuestions = [
  "Hello",
  "What is ClubHub?",
  "How to join organizations?",
  "FYP information",
  "Technology stack",
  "Features",
  "Grade levels and strands",
  "Admin features",
  "Officer features", 
  "Member features",
  "Help with registration",
  "Mobile support",
  "Security features"
];

async function testChatbot() {
  console.log("🤖 Testing ClubHub Chatbot Functionality...\n");
  
  for (let i = 0; i < testQuestions.length; i++) {
    const question = testQuestions[i];
    console.log(`${i + 1}. Testing: "${question}"`);
    
    try {
      const response = await fetch('http://localhost:8080/chatbot/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: question })
      });
      
      const data = await response.json();
      
      if (data.success) {
        console.log(`   ✅ Response received (${data.botResponse.length} characters)`);
        console.log(`   📝 Preview: ${data.botResponse.substring(0, 100)}...`);
      } else {
        console.log(`   ❌ Error: ${data.error}`);
      }
    } catch (error) {
      console.log(`   ❌ Network Error: ${error.message}`);
    }
    
    console.log("");
  }
  
  console.log("🎉 Chatbot functionality test completed!");
}

// Test chatbot page accessibility
async function testChatbotPage() {
  console.log("🌐 Testing Chatbot Page Accessibility...\n");
  
  try {
    const response = await fetch('http://localhost:8080/chatbot');
    if (response.ok) {
      console.log("✅ Chatbot page is accessible (HTTP 200)");
    } else {
      console.log(`❌ Chatbot page error (HTTP ${response.status})`);
    }
  } catch (error) {
    console.log(`❌ Cannot access chatbot page: ${error.message}`);
  }
}

// Run tests
async function runAllTests() {
  await testChatbotPage();
  console.log("");
  await testChatbot();
}

runAllTests();