@echo off
echo ========================================
echo   EcoBot AI Chatbot - Setup Complete
echo ========================================
echo.

echo [Backend Files Created]
echo   ✓ src/models/Chat.js
echo   ✓ src/controllers/chatController.js
echo   ✓ src/routes/chatRoutes.js
echo   ✓ Updated src/server.js
echo.

echo [Frontend Files Created]
echo   ✓ src/components/ChatBot.jsx
echo   ✓ src/pages/ChatPage.jsx
echo   ✓ src/services/chatService.js
echo   ✓ Updated src/App.jsx
echo   ✓ Updated src/components/layout/MainLayout.jsx
echo.

echo [API Endpoints Available]
echo   POST   /api/chat/message
echo   GET    /api/chat/history/:sessionId
echo   DELETE /api/chat/session/:sessionId
echo   GET    /api/chat/sessions (Protected)
echo.

echo [How to Use]
echo   1. Start Backend:   cd ecoback-backend ^&^& npm run dev
echo   2. Start Frontend:  cd ecoback-frontend ^&^& npm run dev
echo   3. Access Chat:     http://localhost:5173/chat
echo   4. Or click the floating chat button (bottom-right)
echo.

echo [Features]
echo   🤖 AI-powered responses
echo   🛍️ Product recommendations
echo   ♻️ Recycling guidance
echo   💰 Wallet support
echo   📱 QR code help
echo   📍 Collection points info
echo.

echo [Documentation]
echo   📖 See CHATBOT_README.md for details
echo.

echo ========================================
echo   Ready to chat! 🌿
echo ========================================
pause
