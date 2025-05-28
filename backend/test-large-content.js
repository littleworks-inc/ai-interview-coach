// ==========================================
// Test Large Content Validation
// ==========================================

const axios = require('axios');

async function testLargeContent() {
  console.log('🧪 Testing Large Content Validation...\n');
  
  // Test 1: Exactly at limit (should work)
  console.log('Test 1: Content at 10,000 character limit');
  const contentAtLimit = 'A'.repeat(9950) + ' This is a job description for a software developer position.';
  console.log(`Length: ${contentAtLimit.length} characters`);
  
  try {
    const response = await axios.post('http://localhost:3000/api/generate', {
      model: 'qwen/qwen3-30b-a3b:free',
      messages: [
        {
          role: 'system',
          content: 'You are an AI Interview Coach.'
        },
        {
          role: 'user',
          content: contentAtLimit
        }
      ]
    });
    console.log('✅ PASS - Content at limit was accepted');
  } catch (error) {
    console.log('❌ FAIL - Content at limit was rejected');
    console.log('Error:', error.response?.data?.error || error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 2: Over limit (should be rejected)
  console.log('Test 2: Content over 10,000 character limit');
  const contentOverLimit = 'A'.repeat(12000) + ' This is a job description for a software developer position.';
  console.log(`Length: ${contentOverLimit.length} characters`);
  
  try {
    const response = await axios.post('http://localhost:3000/api/generate', {
      model: 'qwen/qwen3-30b-a3b:free',
      messages: [
        {
          role: 'system',
          content: 'You are an AI Interview Coach.'
        },
        {
          role: 'user',
          content: contentOverLimit
        }
      ]
    });
    console.log('❌ FAIL - Oversized content was accepted (should be rejected)');
  } catch (error) {
    console.log('✅ PASS - Oversized content was properly rejected');
    console.log('Error Message:', error.response?.data?.error || 'Unknown error');
    console.log('Error Code:', error.response?.data?.code || 'Unknown code');
    console.log('HTTP Status:', error.response?.status || 'Unknown status');
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 3: Way too large (should hit request size limit)
  console.log('Test 3: Content way over limit (should hit request size limit)');
  const contentWayOverLimit = 'A'.repeat(60000); // 60KB of content
  console.log(`Length: ${contentWayOverLimit.length} characters`);
  
  try {
    const response = await axios.post('http://localhost:3000/api/generate', {
      model: 'qwen/qwen3-30b-a3b:free',
      messages: [
        {
          role: 'system',
          content: 'You are an AI Interview Coach.'
        },
        {
          role: 'user',
          content: contentWayOverLimit
        }
      ]
    });
    console.log('❌ FAIL - Extremely large content was accepted (should be rejected)');
  } catch (error) {
    console.log('✅ PASS - Extremely large content was properly rejected');
    console.log('Error Message:', error.response?.data?.error || 'Unknown error');
    console.log('Error Code:', error.response?.data?.code || 'Unknown code');
    console.log('HTTP Status:', error.response?.status || 'Unknown status');
  }
}

// Run the tests
testLargeContent().catch(console.error);