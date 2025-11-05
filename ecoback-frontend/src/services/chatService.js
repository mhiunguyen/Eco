import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Generate or get session ID from localStorage
const getSessionId = () => {
  let sessionId = localStorage.getItem('chatSessionId');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('chatSessionId', sessionId);
  }
  return sessionId;
};

// Send message to chatbot
export const sendMessage = async (message, context = 'general') => {
  try {
    const sessionId = getSessionId();
    const response = await axios.post(`${API_URL}/chat/message`, {
      message,
      sessionId,
      context
    });
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// Get chat history
export const getChatHistory = async () => {
  try {
    const sessionId = getSessionId();
    const response = await axios.get(`${API_URL}/chat/history/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting chat history:', error);
    throw error;
  }
};

// Clear chat session
export const clearChat = async () => {
  try {
    const sessionId = getSessionId();
    await axios.delete(`${API_URL}/chat/session/${sessionId}`);
    // Generate new session ID
    localStorage.removeItem('chatSessionId');
    return true;
  } catch (error) {
    console.error('Error clearing chat:', error);
    throw error;
  }
};

// Get user's chat sessions (requires auth)
export const getUserSessions = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/chat/sessions`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error getting user sessions:', error);
    throw error;
  }
};
