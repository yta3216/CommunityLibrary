const router = require('express').Router();
const { authRequired } = require('../middleware/auth');
const chat_controller = require('../controllers/chat_controller');

// Get chats
router.get('/', authRequired, chat_controller.listChats);

// Send message
router.post('/messages', authRequired, chat_controller.sendFirstMessage);
router.post('/:chatId/messages', authRequired, chat_controller.sendMessage);

// Chat actions
router.patch('/:chatId/lend', authRequired, chat_controller.lendBook);
router.patch('/:chatId/return', authRequired, chat_controller.returnBook);

module.exports = router;