const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

// All chat routes require authentication
router.use(protect);

// Send message and get AI response
router.post('/', chatController.sendMessage);

// Get chat history for current user
router.get('/history', chatController.getChatHistory);

// Clear chat history for current user
router.delete('/history', chatController.clearChatHistory);

// Get all chats (admin only - would need admin check middleware in production)
router.get('/admin/all', chatController.getAllChats);

module.exports = router;
