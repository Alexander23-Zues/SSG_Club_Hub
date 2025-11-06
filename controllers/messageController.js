/*
MIT License

Copyright (c) 2025 Christian I. Cabrera || XianFire Framework
Masaguisi National High School - South Bongabong, Oriental Mindoro
*/

import { Message } from "../models/Message.js";
import { User } from "../models/User.js";

// Middleware to check if user is authenticated
export const requireAuth = async (req, res, next) => {
  // Set no-cache headers to prevent browser caching
  res.set({
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  });

  if (!req.session.userId) {
    return res.redirect("/login");
  }

  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      req.session.destroy();
      return res.redirect("/login");
    }
    req.user = user;
    next();
  } catch (error) {
    console.error("Auth error:", error);
    req.session.destroy();
    res.redirect("/login");
  }
};

export const messagesPage = async (req, res) => {
  try {
    const [inboxMessages, sentMessages, unreadCount, allUsers] = await Promise.all([
      Message.getInboxMessages(req.user.id),
      Message.getSentMessages(req.user.id),
      Message.getUnreadCount(req.user.id),
      Message.getAllUsers()
    ]);

    res.render("messages/index", {
      title: "Messages - Masaguisi ClubHub",
      user: req.user,
      inboxMessages,
      sentMessages,
      unreadCount,
      allUsers: allUsers.filter(u => u.id !== req.user.id)
    });
  } catch (error) {
    console.error("Messages page error:", error);
    res.status(500).send("Server error");
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { receiver_id, receiver_role, subject, message } = req.body;
    
    if (!subject || !message) {
      return res.json({ error: 'Subject and message are required' });
    }

    await Message.create({
      sender_id: req.user.id,
      receiver_id: receiver_id || null,
      receiver_role: receiver_role || null,
      subject,
      message
    });

    res.json({ success: true, message: 'Message sent successfully!' });
  } catch (error) {
    console.error("Send message error:", error);
    res.json({ error: 'Failed to send message' });
  }
};

export const markMessageRead = async (req, res) => {
  try {
    const { id } = req.params;
    await Message.markAsRead(id, req.user.id);
    res.json({ success: true });
  } catch (error) {
    console.error("Mark read error:", error);
    res.json({ error: 'Failed to mark message as read' });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Message.deleteMessage(id, req.user.id);
    
    if (deleted) {
      res.json({ success: true, message: 'Message deleted successfully!' });
    } else {
      res.json({ error: 'Message not found or access denied' });
    }
  } catch (error) {
    console.error("Delete message error:", error);
    res.json({ error: 'Failed to delete message' });
  }
};