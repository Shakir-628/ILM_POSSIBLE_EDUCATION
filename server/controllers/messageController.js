import Message from "../models/Message.js";
import Notification from "../models/Notification.js";
import User from "../models/User.js";

// @desc    Get all messages for a user (inbox)
// @route   GET /api/messages/inbox
// @access  Private
export const getInbox = async (req, res) => {
  try {
    const messages = await Message.find({
      recipient: req.user._id,
      deletedByRecipient: false,
    })
      .populate("sender", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    console.error("Get inbox error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get sent messages
// @route   GET /api/messages/sent
// @access  Private
export const getSentMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      sender: req.user._id,
      deletedBySender: false,
    })
      .populate("recipient", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    console.error("Get sent messages error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get message by ID
// @route   GET /api/messages/:id
// @access  Private
export const getMessageById = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id)
      .populate("sender", "name email role")
      .populate("recipient", "name email role");

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    // Check if user is sender or recipient
    if (
      message.sender._id.toString() !== req.user._id.toString() &&
      message.recipient._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this message",
      });
    }

    // Mark as read if recipient is viewing
    if (message.recipient._id.toString() === req.user._id.toString() && !message.readAt) {
      message.status = "read";
      message.readAt = new Date();
      await message.save();
    }

    res.status(200).json({
      success: true,
      data: message,
    });
  } catch (error) {
    console.error("Get message error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
export const sendMessage = async (req, res) => {
  try {
    let recipientId = req.body.recipient;

    // If recipient is an email, look up the user
    if (typeof recipientId === 'string' && recipientId.includes('@')) {
      const recipientUser = await User.findOne({ email: recipientId });
      
      if (!recipientUser) {
        return res.status(404).json({
          success: false,
          message: `User with email ${recipientId} not found`,
        });
      }
      
      recipientId = recipientUser._id;
    }

    const messageData = {
      ...req.body,
      recipient: recipientId,
      sender: req.user._id,
      status: "sent",
    };

    const message = await Message.create(messageData);

    await message.populate("sender", "name email role");
    await message.populate("recipient", "name email role");

    // Create notification for recipient
    await Notification.create({
      recipient: message.recipient._id,
      title: "New Message",
      message: `You have a new message from ${req.user.name}`,
      type: "message",
      relatedEntity: "message",
      relatedEntityId: message._id,
      link: `/messages/${message._id}`,
      actionText: "View Message",
    });

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: message,
    });
  } catch (error) {
    console.error("Send message error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete message (soft delete)
// @route   DELETE /api/messages/:id
// @access  Private
export const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    // Soft delete based on user role
    if (message.sender.toString() === req.user._id.toString()) {
      message.deletedBySender = true;
    } else if (message.recipient.toString() === req.user._id.toString()) {
      message.deletedByRecipient = true;
    } else {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this message",
      });
    }

    await message.save();

    // If both deleted, actually delete the message
    if (message.deletedBySender && message.deletedByRecipient) {
      await message.deleteOne();
    }

    res.status(200).json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    console.error("Delete message error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get unread message count
// @route   GET /api/messages/unread/count
// @access  Private
export const getUnreadCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({
      recipient: req.user._id,
      status: { $in: ["sent", "delivered"] },
      deletedByRecipient: false,
    });

    res.status(200).json({
      success: true,
      count,
    });
  } catch (error) {
    console.error("Get unread count error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

