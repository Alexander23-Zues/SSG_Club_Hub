/*
MIT License

Copyright (c) 2025 Christian I. Cabrera || XianFire Framework
Masaguisi High School
*/

import { Chatbot } from "../models/Chatbot.js";

export const chatbotPage = async (req, res) => {
  try {
    let conversationHistory = [];
    
    if (req.session.userId) {
      conversationHistory = await Chatbot.getConversationHistory(req.session.userId, null, 20);
    }
    
    res.render("chatbot/index", {
      title: "ClubHub Assistant - Masaguisi ClubHub",
      user: req.user || null,
      conversationHistory
    });
  } catch (error) {
    console.error("Chatbot page error:", error);
    res.status(500).send("Server error");
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message || message.trim() === '') {
      return res.json({ error: 'Walang message na na-send. Please type your question!' });
    }
    
    // Generate bot response (now with enhanced Masaguisi-specific content)
    let botResponse;
    
    // Check if message needs Google search integration
    if (message.toLowerCase().includes('search') || message.toLowerCase().includes('google')) {
      botResponse = await Chatbot.searchGoogle(message.trim());
    } else {
      botResponse = Chatbot.generateResponse(message.trim());
    }
    
    // Save conversation if user is logged in
    if (req.session.userId) {
      const sessionId = req.session.chatSessionId || `session_${Date.now()}_${req.session.userId}`;
      req.session.chatSessionId = sessionId;
      
      await Chatbot.saveConversation({
        user_id: req.session.userId,
        user_message: message.trim(),
        bot_response: botResponse,
        session_id: sessionId
      });
    }
    
    res.json({
      success: true,
      userMessage: message.trim(),
      botResponse: botResponse,
      timestamp: new Date().toISOString(),
      source: 'Masaguisi ClubHub AI Assistant'
    });
    
  } catch (error) {
    console.error("Send message error:", error);
    res.json({ 
      error: 'May problema sa pag-process ng message. Please try again!',
      success: false 
    });
  }
};

export const getChatHistory = async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.json({ conversations: [] });
    }
    
    const conversations = await Chatbot.getConversationHistory(req.session.userId, null, 50);
    res.json({ conversations });
    
  } catch (error) {
    console.error("Get chat history error:", error);
    res.json({ error: 'Failed to get chat history' });
  }
};