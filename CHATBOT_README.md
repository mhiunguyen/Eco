# 🤖 EcoBot AI - Trợ lý thông minh cho EcoBack

## 📋 Tổng quan

EcoBot là trợ lý AI thông minh được tích hợp vào ứng dụng EcoBack, giúp người dùng:
- 🛍️ Tư vấn sản phẩm xanh
- ♻️ Hướng dẫn tái chế rác thải
- 💰 Hỗ trợ về ví điện tử và điểm thưởng
- 📱 Hướng dẫn sử dụng ứng dụng
- 📍 Tìm điểm thu gom gần nhất

## 🎯 Tính năng

### 1. **Floating Chat Widget**
- Nút chat nổi ở góc phải màn hình
- Có thể truy cập từ mọi trang
- Giao diện nhỏ gọn, không chiếm diện tích

### 2. **Chat Page (Trang chat đầy đủ)**
- Giao diện chat toàn màn hình
- Quick suggestions (Gợi ý nhanh)
- Lịch sử hội thoại
- Truy cập qua `/chat`

### 3. **AI Response Intelligence**
- Nhận diện ngữ cảnh câu hỏi
- Trả lời thông minh về:
  - Sản phẩm xanh
  - Hướng dẫn tái chế
  - Ví điện tử
  - QR Code
  - Tài khoản
- Tự động gợi ý sản phẩm từ database

## 🏗️ Kiến trúc

### Backend
```
ecoback-backend/src/
├── models/
│   └── Chat.js                 # Model lưu lịch sử chat
├── controllers/
│   └── chatController.js       # Logic xử lý chat & AI
└── routes/
    └── chatRoutes.js          # API endpoints
```

### Frontend
```
ecoback-frontend/src/
├── components/
│   └── ChatBot.jsx            # Floating chat widget
├── pages/
│   └── ChatPage.jsx           # Full chat page
└── services/
    └── chatService.js         # API service
```

## 🔌 API Endpoints

### 1. **Gửi tin nhắn**
```http
POST /api/chat/message
Content-Type: application/json

{
  "message": "Giới thiệu sản phẩm xanh",
  "sessionId": "session_123456",
  "context": "general"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "🌿 Mình xin giới thiệu...",
    "sessionId": "session_123456",
    "timestamp": "2025-11-05T10:30:00.000Z"
  }
}
```

### 2. **Lấy lịch sử chat**
```http
GET /api/chat/history/:sessionId
```

### 3. **Xóa chat session**
```http
DELETE /api/chat/session/:sessionId
```

### 4. **Lấy tất cả sessions của user (Cần auth)**
```http
GET /api/chat/sessions
Authorization: Bearer <token>
```

## 💾 Database Schema

### Chat Model
```javascript
{
  user: ObjectId,              // Tùy chọn
  sessionId: String,           // Unique session ID
  messages: [{
    role: String,              // 'user' | 'assistant' | 'system'
    content: String,
    timestamp: Date
  }],
  context: String,             // 'general' | 'product' | 'recycle' | ...
  metadata: {
    userAgent: String,
    ipAddress: String,
    language: String
  },
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## 🚀 Cách sử dụng

### 1. Floating Chat Widget (Tự động xuất hiện)
```jsx
// Đã tích hợp trong MainLayout.jsx
import ChatBot from '../ChatBot';

<MainLayout>
  <Outlet />
  <ChatBot />
</MainLayout>
```

### 2. Chat Page (Trang riêng)
```
Truy cập: http://localhost:5173/chat
```

### 3. Sử dụng Chat Service
```javascript
import { sendMessage, getChatHistory, clearChat } from '@/services/chatService';

// Gửi tin nhắn
const response = await sendMessage('Xin chào');

// Lấy lịch sử
const history = await getChatHistory();

// Xóa chat
await clearChat();
```

## 🎨 UI/UX Features

### Floating Widget
- ✅ Nút chat tròn với icon 🌿
- ✅ Hiệu ứng hover & scale
- ✅ Chat window 96x600px
- ✅ Auto-scroll to bottom
- ✅ Loading state với spinner
- ✅ Xóa lịch sử chat

### Chat Page
- ✅ Full-screen chat interface
- ✅ Quick suggestions (6 gợi ý)
- ✅ Gradient background
- ✅ Fixed input at bottom
- ✅ Responsive design
- ✅ Back navigation

## 🧠 AI Logic

### Nhận dạng Intent
```javascript
// Sản phẩm
keywords: ['sản phẩm', 'mua', 'giới thiệu']
→ Gợi ý 3 sản phẩm xanh từ database

// Tái chế
keywords: ['tái chế', 'rác', 'thu gom']
→ Hướng dẫn phân loại & thu gom

// Ví điện tử
keywords: ['ví', 'điểm', 'tiền', 'rút']
→ Hướng dẫn tích điểm & rút tiền

// QR Code
keywords: ['qr', 'quét', 'mã']
→ Hướng dẫn quét QR

// Tài khoản
keywords: ['đăng ký', 'đăng nhập', 'tài khoản']
→ Hướng dẫn đăng ký/đăng nhập
```

## 🔮 Nâng cấp tương lai

### Phase 2: Tích hợp AI thực
```javascript
// OpenAI GPT-4
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Google Gemini
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
```

### Phase 3: Tính năng nâng cao
- [ ] Voice input/output
- [ ] Multi-language support
- [ ] Sentiment analysis
- [ ] Personalized recommendations
- [ ] Image recognition (sản phẩm từ ảnh)
- [ ] Chat history export
- [ ] Rating & feedback

## 📊 Performance

### Tối ưu hóa
- Session management với localStorage
- Message pagination (50 tin nhắn/lần)
- Auto-cleanup inactive sessions
- Database indexing (sessionId, user, createdAt)

### Caching
```javascript
// Frontend cache
localStorage: 'chatSessionId'

// Backend optimization
- Index: { sessionId: 1, createdAt: -1 }
- Limit recent messages: 10
```

## 🐛 Troubleshooting

### Chatbot không xuất hiện
```bash
# Check component import
# Verify MainLayout.jsx includes <ChatBot />
```

### API không hoạt động
```bash
# Check backend route registered
# Verify /api/chat/message endpoint

curl http://localhost:5000/api/chat/message -X POST \
  -H "Content-Type: application/json" \
  -d '{"message":"test","sessionId":"test123"}'
```

### Session bị mất
```javascript
// Clear và tạo lại session
localStorage.removeItem('chatSessionId');
// Reload page
```

## 📝 Ví dụ sử dụng

### 1. Hỏi về sản phẩm
```
User: "Giới thiệu sản phẩm xanh"
Bot: "🌿 Mình xin giới thiệu một số sản phẩm xanh..."
```

### 2. Hướng dẫn tái chế
```
User: "Làm sao tái chế rác?"
Bot: "♻️ Hướng dẫn tái chế: 1. Phân loại rác..."
```

### 3. Hỗ trợ ví
```
User: "Làm sao rút tiền?"
Bot: "💰 Hệ thống ví điện tử EcoBack..."
```

## 🎯 KPIs

### Metrics cần theo dõi
- 📊 Số lượng chat sessions/ngày
- 💬 Số tin nhắn trung bình/session
- ⏱️ Thời gian phản hồi trung bình
- 😊 User satisfaction rate
- 🔄 Conversion rate (chat → action)

## 🔐 Security

### Data Protection
- ✅ Anonymous chat support (không cần đăng nhập)
- ✅ Session isolation
- ✅ Input sanitization
- ✅ Rate limiting (TODO)
- ✅ No sensitive data storage

## 📱 Mobile Responsive

### Breakpoints
- **Desktop**: Full chat page + floating widget
- **Tablet**: Optimized layout
- **Mobile**: Bottom sheet style chat

---

## 🎉 Hoàn thành!

Chatbot AI đã sẵn sàng sử dụng. Người dùng có thể:
1. Click nút chat nổi ở góc phải
2. Truy cập `/chat` cho full page
3. Hỏi bất kỳ câu hỏi nào về EcoBack

**Built with 💚 for sustainable future**
