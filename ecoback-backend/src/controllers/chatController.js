const Chat = require('../models/Chat');
const Product = require('../models/Product');
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');

// Simple AI response generator (can be replaced with OpenAI/Gemini)
const generateAIResponse = async (message, context, chatHistory) => {
  const lowerMessage = message.toLowerCase();
  
  // Eco-friendly product recommendations
  if (lowerMessage.includes('sản phẩm') || lowerMessage.includes('mua') || lowerMessage.includes('giới thiệu')) {
    const products = await Product.find({ isGreenProduct: true }).limit(3);
    if (products.length > 0) {
      let response = '🌿 Mình xin giới thiệu một số sản phẩm xanh tuyệt vời:\n\n';
      products.forEach((p, i) => {
        response += `${i + 1}. **${p.name}**\n`;
        response += `   💰 Giá: ${p.price.toLocaleString('vi-VN')}đ\n`;
        response += `   ♻️ Cashback: ${p.cashbackPercentage}%\n`;
        if (p.greenAttributes?.length > 0) {
          response += `   ✨ Đặc điểm: ${p.greenAttributes.join(', ')}\n`;
        }
        response += '\n';
      });
      return response + 'Bạn có muốn xem chi tiết sản phẩm nào không? 😊';
    }
  }
  
  // Recycling guidance
  if (lowerMessage.includes('tái chế') || lowerMessage.includes('rác') || lowerMessage.includes('thu gom')) {
    return `♻️ **Hướng dẫn tái chế:**

1. **Phân loại rác:** 
   - Nhựa: chai nước, túi nilon sạch
   - Giấy: báo cũ, hộp carton
   - Kim loại: lon nước ngọt, vỏ hộp
   - Thủy tinh: chai lọ, bình

2. **Thu gom:**
   - 📍 Tìm điểm thu gom gần nhất trong mục "Bản đồ"
   - 📞 Đặt lịch thu gom tận nhà qua "Yêu cầu thu gom"

3. **Nhận thưởng:**
   - 💰 Tích lũy điểm khi tái chế
   - 🎁 Đổi quà hoặc rút tiền

Bạn muốn tìm điểm thu gom gần bạn không? 😊`;
  }
  
  // Wallet and points
  if (lowerMessage.includes('ví') || lowerMessage.includes('điểm') || lowerMessage.includes('tiền') || lowerMessage.includes('rút')) {
    return `💰 **Hệ thống ví điện tử EcoBack:**

1. **Cách tích điểm:**
   - 🛍️ Mua sản phẩm xanh → nhận cashback
   - ♻️ Tái chế rác → nhận điểm thưởng
   - 📱 Quét QR trên sản phẩm → kích hoạt cashback

2. **Sử dụng điểm:**
   - Xem số dư trong mục "Ví"
   - Rút tiền về tài khoản ngân hàng
   - Đổi quà, voucher

3. **Lịch sử giao dịch:**
   - Theo dõi đầy đủ trong mục "Ví" > "Lịch sử"

Bạn cần hỗ trợ gì về ví không? 😊`;
  }
  
  // QR Code scanning
  if (lowerMessage.includes('qr') || lowerMessage.includes('quét') || lowerMessage.includes('mã')) {
    return `📱 **Hướng dẫn quét QR Code:**

1. **Quét mã sản phẩm:**
   - Vào mục "Quét QR" trên thanh menu
   - Cho phép truy cập camera
   - Đưa camera vào mã QR trên bao bì

2. **Nhận thưởng:**
   - Kích hoạt cashback ngay lập tức
   - Điểm được cộng vào ví tự động

3. **Đánh dấu tái chế:**
   - Sau khi dùng xong sản phẩm
   - Quét lại QR và chọn "Đã tái chế"
   - Nhận thêm điểm thưởng môi trường

Bạn đã thử quét QR chưa? 😊`;
  }
  
  // Registration and login
  if (lowerMessage.includes('đăng ký') || lowerMessage.includes('đăng nhập') || lowerMessage.includes('tài khoản')) {
    return `👤 **Tài khoản EcoBack:**

1. **Đăng ký mới:**
   - Click "Đăng ký" trên trang chủ
   - Nhập họ tên, email, số điện thoại
   - Tạo mật khẩu an toàn
   - Xác nhận email

2. **Đăng nhập:**
   - Dùng email/số điện thoại + mật khẩu
   - Hoặc đăng nhập nhanh với Google

3. **Quên mật khẩu:**
   - Click "Quên mật khẩu"
   - Nhập email đăng ký
   - Làm theo hướng dẫn trong email

Bạn cần hỗ trợ gì về tài khoản không? 😊`;
  }
  
  // General greetings
  if (lowerMessage.includes('xin chào') || lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('chào')) {
    return `Xin chào! 👋 Mình là trợ lý AI của EcoBack 🌿

Mình có thể giúp bạn:
- 🛍️ Tư vấn sản phẩm xanh
- ♻️ Hướng dẫn tái chế
- 💰 Hỗ trợ về ví và điểm thưởng
- 📱 Hướng dẫn sử dụng app
- 📍 Tìm điểm thu gom

Bạn cần hỗ trợ gì hôm nay? 😊`;
  }
  
  // Thank you
  if (lowerMessage.includes('cảm ơn') || lowerMessage.includes('cám ơn') || lowerMessage.includes('thanks')) {
    return `Không có gì! 😊 Rất vui được hỗ trợ bạn.\n\nNếu còn thắc mắc gì, đừng ngại hỏi mình nhé! 🌿`;
  }
  
  // Default response
  return `Xin lỗi, mình chưa hiểu rõ câu hỏi của bạn. 😅

Bạn có thể hỏi mình về:
- 🛍️ Sản phẩm xanh và mua sắm
- ♻️ Tái chế và thu gom rác
- 💰 Ví điện tử và điểm thưởng
- 📱 Cách sử dụng app
- 📍 Điểm thu gom gần bạn

Hoặc bạn có thể nói rõ hơn để mình hỗ trợ tốt hơn nhé! 😊`;
};

// @desc    Send message to chatbot
// @route   POST /api/chat/message
// @access  Public
exports.sendMessage = asyncHandler(async (req, res, next) => {
  const { message, sessionId, context = 'general' } = req.body;
  
  if (!message || !sessionId) {
    return next(new ErrorResponse('Vui lòng cung cấp tin nhắn và session ID', 400));
  }
  
  // Find or create chat session
  const userId = req.user ? req.user.id : null;
  let chat = await Chat.findOrCreateSession(sessionId, userId);
  
  // Update context if provided
  if (context) {
    chat.context = context;
  }
  
  // Add user message
  await chat.addMessage('user', message);
  
  // Generate AI response
  const chatHistory = chat.getRecentMessages(10);
  const aiResponse = await generateAIResponse(message, chat.context, chatHistory);
  
  // Add AI response
  await chat.addMessage('assistant', aiResponse);
  
  res.status(200).json({
    success: true,
    data: {
      message: aiResponse,
      sessionId: chat.sessionId,
      timestamp: new Date()
    }
  });
});

// @desc    Get chat history
// @route   GET /api/chat/history/:sessionId
// @access  Public
exports.getChatHistory = asyncHandler(async (req, res, next) => {
  const { sessionId } = req.params;
  const { limit = 50 } = req.query;
  
  const chat = await Chat.findOne({ sessionId, isActive: true });
  
  if (!chat) {
    return res.status(200).json({
      success: true,
      data: {
        messages: [],
        sessionId
      }
    });
  }
  
  // Filter out system messages for user view
  const messages = chat.messages
    .filter(m => m.role !== 'system')
    .slice(-limit);
  
  res.status(200).json({
    success: true,
    data: {
      messages,
      sessionId: chat.sessionId,
      context: chat.context
    }
  });
});

// @desc    Clear chat session
// @route   DELETE /api/chat/session/:sessionId
// @access  Public
exports.clearChat = asyncHandler(async (req, res, next) => {
  const { sessionId } = req.params;
  
  const chat = await Chat.findOne({ sessionId });
  
  if (chat) {
    chat.isActive = false;
    await chat.save();
  }
  
  res.status(200).json({
    success: true,
    message: 'Đã xóa lịch sử chat'
  });
});

// @desc    Get user's all chat sessions
// @route   GET /api/chat/sessions
// @access  Private
exports.getUserSessions = asyncHandler(async (req, res, next) => {
  const chats = await Chat.find({
    user: req.user.id,
    isActive: true
  })
    .sort('-updatedAt')
    .limit(10);
  
  const sessions = chats.map(chat => ({
    sessionId: chat.sessionId,
    context: chat.context,
    lastMessage: chat.messages[chat.messages.length - 1]?.content.substring(0, 100),
    updatedAt: chat.updatedAt,
    messageCount: chat.messages.filter(m => m.role !== 'system').length
  }));
  
  res.status(200).json({
    success: true,
    count: sessions.length,
    data: sessions
  });
});
