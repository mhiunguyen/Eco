const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const chatSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Allow anonymous chats
  },
  sessionId: {
    type: String,
    required: true,
    index: true
  },
  messages: [messageSchema],
  context: {
    type: String,
    enum: ['general', 'product', 'recycle', 'wallet', 'support'],
    default: 'general'
  },
  metadata: {
    userAgent: String,
    ipAddress: String,
    language: {
      type: String,
      default: 'vi'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster queries
chatSchema.index({ user: 1, createdAt: -1 });
chatSchema.index({ sessionId: 1, createdAt: -1 });

// Method to add a message
chatSchema.methods.addMessage = function(role, content) {
  this.messages.push({ role, content });
  return this.save();
};

// Get recent messages (last N messages)
chatSchema.methods.getRecentMessages = function(limit = 10) {
  return this.messages.slice(-limit);
};

// Static method to find or create chat session
chatSchema.statics.findOrCreateSession = async function(sessionId, userId = null) {
  let chat = await this.findOne({ sessionId, isActive: true });
  
  if (!chat) {
    chat = await this.create({
      sessionId,
      user: userId,
      messages: [{
        role: 'system',
        content: 'Bạn là trợ lý AI của EcoBack, một nền tảng mua sắm xanh và tái chế. Nhiệm vụ của bạn là tư vấn về sản phẩm thân thiện môi trường, hướng dẫn tái chế, giải đáp thắc mắc về ví điện tử và điểm thưởng. Hãy trả lời bằng tiếng Việt, thân thiện, nhiệt tình và chuyên nghiệp.'
      }]
    });
  }
  
  return chat;
};

module.exports = mongoose.model('Chat', chatSchema);
