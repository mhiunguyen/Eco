/**
 * Test script for EcoBot AI Chatbot
 * Run: node test-chatbot.js
 */

const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

// Test data
const testMessages = [
  'Xin chào',
  'Giới thiệu sản phẩm xanh',
  'Làm sao tái chế rác?',
  'Hướng dẫn sử dụng ví',
  'Quét QR như thế nào?',
  'Cảm ơn'
];

const sessionId = `test_${Date.now()}`;

async function testChatbot() {
  console.log('🤖 Testing EcoBot AI Chatbot...\n');
  console.log('Session ID:', sessionId);
  console.log('=' .repeat(60), '\n');

  for (const message of testMessages) {
    try {
      console.log(`👤 User: ${message}`);
      
      const response = await axios.post(`${API_URL}/chat/message`, {
        message,
        sessionId,
        context: 'general'
      });

      if (response.data.success) {
        const botMessage = response.data.data.message;
        console.log(`🤖 EcoBot: ${botMessage.substring(0, 150)}...`);
        console.log('-'.repeat(60), '\n');
      }

      // Wait 1 second between messages
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('❌ Error:', error.message);
      if (error.response) {
        console.error('Response:', error.response.data);
      }
    }
  }

  // Test get history
  try {
    console.log('📜 Testing chat history...');
    const historyResponse = await axios.get(`${API_URL}/chat/history/${sessionId}`);
    
    if (historyResponse.data.success) {
      const messageCount = historyResponse.data.data.messages.length;
      console.log(`✅ History retrieved: ${messageCount} messages`);
    }
  } catch (error) {
    console.error('❌ Error getting history:', error.message);
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Test completed!');
}

// Run tests
testChatbot().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
