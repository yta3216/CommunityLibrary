const router = require('express').Router();
const { authRequired } = require('../middleware/auth');
const chatController = require('../controllers/chatController');

// Get chats
router.get('/', authRequired, chatController.listChats);

// Send message
router.post('/messages', authRequired, chatController.sendFirstMessage);
router.post('/:chatId/messages', authRequired, chatController.sendMessage);

// Chat actions
router.patch('/:chatId/lend', authRequired, chatController.lendBook);
router.patch('/:chatId/return', authRequired, chatController.returnBook);

module.exports = router;