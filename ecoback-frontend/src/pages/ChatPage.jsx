import { useState, useEffect, useRef } from 'react';
import { sendMessage, getChatHistory, clearChat } from '../services/chatService';
import { Send, Trash2, Loader, ArrowLeft, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ChatPage = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  // Quick suggestions
  const quickSuggestions = [
    { icon: '🛍️', text: 'Giới thiệu sản phẩm xanh', query: 'Giới thiệu cho tôi một số sản phẩm xanh' },
    { icon: '♻️', text: 'Hướng dẫn tái chế', query: 'Làm sao để tái chế rác thải đúng cách?' },
    { icon: '💰', text: 'Tích điểm và rút tiền', query: 'Tôi muốn biết cách tích điểm và rút tiền' },
    { icon: '📱', text: 'Quét mã QR', query: 'Hướng dẫn quét mã QR để nhận thưởng' },
    { icon: '📍', text: 'Điểm thu gom', query: 'Tìm điểm thu gom rác gần tôi' },
    { icon: '🎁', text: 'Ưu đãi hiện tại', query: 'Có những ưu đãi gì đang diễn ra?' }
  ];

  useEffect(() => {
    loadChatHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatHistory = async () => {
    try {
      const response = await getChatHistory();
      if (response.data.messages.length > 0) {
        setMessages(response.data.messages);
      } else {
        // Show welcome message
        setMessages([{
          role: 'assistant',
          content: 'Xin chào! 👋 Mình là trợ lý AI của EcoBack 🌿\n\nMình có thể giúp bạn:\n- 🛍️ Tư vấn sản phẩm xanh\n- ♻️ Hướng dẫn tái chế\n- 💰 Hỗ trợ về ví và điểm thưởng\n- 📱 Hướng dẫn sử dụng app\n- 📍 Tìm điểm thu gom\n\nBạn cần hỗ trợ gì hôm nay? 😊',
          timestamp: new Date()
        }]);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const handleSendMessage = async (messageText = null) => {
    const textToSend = messageText || inputMessage.trim();
    
    if (!textToSend || isLoading) return;

    setInputMessage('');
    
    // Add user message to chat
    const newUserMessage = {
      role: 'user',
      content: textToSend,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      const response = await sendMessage(textToSend);
      
      // Add AI response to chat
      const aiMessage = {
        role: 'assistant',
        content: response.data.message,
        timestamp: new Date(response.data.timestamp)
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message
      const errorMessage = {
        role: 'assistant',
        content: 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau! 😔',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = async () => {
    if (window.confirm('Bạn có chắc muốn xóa toàn bộ lịch sử chat?')) {
      try {
        await clearChat();
        setMessages([{
          role: 'assistant',
          content: 'Xin chào! 👋 Mình là trợ lý AI của EcoBack 🌿\n\nBạn cần hỗ trợ gì hôm nay? 😊',
          timestamp: new Date()
        }]);
      } catch (error) {
        console.error('Error clearing chat:', error);
      }
    }
  };

  const handleSuggestionClick = (query) => {
    handleSendMessage(query);
  };

  const formatMessage = (content) => {
    return content.split('\n').map((line, i) => (
      <span key={i}>
        {line}
        {i < content.split('\n').length - 1 && <br />}
      </span>
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={24} />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                  <Sparkles className="text-white" size={24} />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">EcoBot AI</h1>
                  <p className="text-sm text-gray-500">Trợ lý thông minh của bạn</p>
                </div>
              </div>
            </div>
            <button
              onClick={handleClearChat}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 size={18} />
              <span className="hidden sm:inline">Xóa lịch sử</span>
            </button>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="container mx-auto px-4 pb-32">
        <div className="max-w-4xl mx-auto py-6 space-y-6">
          {/* Quick Suggestions */}
          {messages.length <= 1 && (
            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Sparkles size={20} className="text-green-600" />
                Bạn có thể hỏi mình về:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {quickSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion.query)}
                    className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all text-left group"
                  >
                    <span className="text-2xl">{suggestion.icon}</span>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-green-700">
                      {suggestion.text}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-5 py-4 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-green-600 to-green-500 text-white shadow-lg'
                    : 'bg-white text-gray-800 shadow-sm border border-gray-100'
                }`}
              >
                <p className="text-base whitespace-pre-wrap leading-relaxed">
                  {formatMessage(message.content)}
                </p>
                <p className={`text-xs mt-2 ${
                  message.role === 'user' ? 'text-green-100' : 'text-gray-400'
                }`}>
                  {new Date(message.timestamp).toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white rounded-2xl px-5 py-4 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                  <Loader className="animate-spin text-green-600" size={20} />
                  <span className="text-sm text-gray-600">EcoBot đang suy nghĩ...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Box - Fixed at Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="flex gap-3">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Nhập câu hỏi của bạn..."
                className="flex-1 px-5 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-base"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="bg-gradient-to-br from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed text-white px-6 py-4 rounded-2xl transition-all shadow-lg hover:shadow-xl"
              >
                <Send size={24} />
              </button>
            </form>
            <p className="text-xs text-gray-500 text-center mt-2">
              EcoBot có thể mắc lỗi. Vui lòng kiểm tra thông tin quan trọng.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
