const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema({
  name: String,
  url: String,
  type: String,
  size: Number
});


const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  },
  contract: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contract'
  },
  application: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application'
  },
  subject: {
    type: String,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    maxlength: 5000
  },
  messageType: {
    type: String,
    enum: ['text', 'file', 'image', 'video', 'audio'],
    default: 'text'
  },
    attachments: [attachmentSchema],
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  isDeleted: {
    sender: {
      type: Boolean,
      default: false
    },
    recipient: {
      type: Boolean,
      default: false
    }
  },
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  threadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  tags: [{
    type: String,
    maxlength: 50
  }],
  metadata: {
    ipAddress: String,
    userAgent: String,
    platform: String
  }
}, {
  timestamps: true
});

// Index for efficient queries
messageSchema.index({ sender: 1, recipient: 1 });
messageSchema.index({ recipient: 1, isRead: 1 });
messageSchema.index({ job: 1 });
messageSchema.index({ contract: 1 });
messageSchema.index({ threadId: 1 });
messageSchema.index({ createdAt: -1 });

// Virtual for conversation ID
messageSchema.virtual('conversationId').get(function() {
  const users = [this.sender.toString(), this.recipient.toString()].sort();
  return `${users[0]}-${users[1]}`;
});

module.exports = mongoose.model('Message', messageSchema); 