const chatService = require('../services/chatService');

const listChats = async (req, res, next) => {
    try { res.json(await chatService.listChats(req.user.id)); } catch (err) { next(err); }
};

// Send message
const sendFirstMessage = async (req, res, next) => {
    try {
        const { chat, isCreated } = await chatService.sendFirstMessage({
            bookId: req.body.bookId, requesterId: req.user.id, text: req.body.text,
        });
        res.status(isCreated ? 201 : 200).json(chat);
    } catch (err) { next(err); }
};

const sendMessage = async (req, res, next) => {
    try {
        res.json(await chatService.sendMessage(req.params.chatId, req.user.id, req.body.text));
    } catch (err) { next(err); }
};

// Chat actions
const lendBook = async (req, res, next) => {
    try {
        res.json(await chatService.lendBook(req.params.chatId, req.user.id));
    } catch (err) { next(err); }
};

const returnBook = async (req, res, next) => {
    try {
        res.json(await chatService.returnBook(req.params.chatId, req.user.id));
    } catch (err) { next(err); }
};

module.exports = { listChats, sendFirstMessage, sendMessage, lendBook, returnBook };