const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Message = require('../models/Message');

// Send message
router.post('/', auth, async (req, res) => {
  try {
    const { recipientId, content, jobId, messageType, attachments } = req.body;

    const message = new Message({
      sender: req.user.id,
      recipient: recipientId,
      job: jobId,
      content,
      messageType,
      attachments
    });

    await message.save();

    // Populate sender and recipient for response
    await message.populate([
      { path: 'sender', select: 'name email' },
      { path: 'recipient', select: 'name email' }
    ]);

    // Notify recipient via socket
    const io = req.app.get('io');
    io.to(jobId).emit('chat-message', message);

    res.status(201).json({
      message: 'Message sent successfully',
      message
    });
  } catch (error) {
    console.error('Send message error:', error.message, error.stack);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get conversations
router.get('/conversations', auth, async (req, res) => {
  try {
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: req.user._id },
            { recipient: req.user._id }
          ],
          'isDeleted.sender': { $ne: true },
          'isDeleted.recipient': { $ne: true }
        }
      },
      {
        $addFields: {
          conversationId: {
            $cond: {
              if: { $eq: ['$sender', req.user._id] },
              then: '$recipient',
              else: '$sender'
            }
          }
        }
      },
      {
        $group: {
          _id: '$conversationId',
          lastMessage: { $last: '$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                { $and: [
                  { $eq: ['$recipient', req.user._id] },
                  { $eq: ['$isRead', false] }
                ]},
                1,
                0
              ]
            }
          }
        }
      },
      {
        $sort: { 'lastMessage.createdAt': -1 }
      }
    ]);

    // Populate user details
    const populatedConversations = await Message.populate(conversations, [
      { path: 'lastMessage.sender', select: 'name email' },
      { path: 'lastMessage.recipient', select: 'name email' }
    ]);

    res.json(populatedConversations);
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get messages in conversation
router.get('/conversation/:jobId', auth, async (req, res) => {
  try {
    const messages = await Message.find({
      job: req.params.jobId,
      'isDeleted.sender': { $ne: true },
      'isDeleted.recipient': { $ne: true }
    })
    .populate('sender', 'name email')
    .populate('recipient', 'name email')
    .sort({ createdAt: 1 });

    // Mark messages as read
    await Message.updateMany(
      {
        job: req.params.jobId,
        recipient: req.user.id,
        isRead: false
      },
      {
        isRead: true,
        readAt: new Date()
      }
    );

    res.json(messages);
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark message as read
router.put('/:id/read', auth, async (req, res) => {
  try {
    const message = await Message.findOneAndUpdate(
      {
        _id: req.params.id,
        recipient: req.user.id
      },
      {
        isRead: true,
        readAt: new Date()
      },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    res.json({ message: 'Message marked as read', message });
  } catch (error) {
    console.error('Mark message read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete message
router.delete('/:id', auth, async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    if (message.sender.toString() !== req.user.id &&
        message.recipient.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (message.sender.toString() === req.user.id) {
      message.isDeleted.sender = true;
    } else {
      message.isDeleted.recipient = true;
    }

    await message.save();

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;