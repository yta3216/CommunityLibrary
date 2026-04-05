const chat_service = require('../services/chat_service');

const listChats = async (req, res, next) => {
    try { res.json(await chat_service.listChats(req.user.id)); } catch (err) { next(err); }
};

const sendFirstMessage = async (req, res, next) => {
    try {
        const { chat, isCreated } = await chat_service.sendFirstMessage({
            bookId: req.body.bookId, requesterId: req.user.id, text: req.body.text,
        });
        res.status(isCreated ? 201 : 200).json(chat);
    } catch (err) { next(err); }
};

const sendMessage = async (req, res, next) => { try { res.json(await chat_service.sendMessage(req.params.chatId, req.user.id, req.body.text)); } catch (err) { next(err); } };
const lendBook = async (req, res, next) => { try { res.json(await chat_service.lendBook(req.params.chatId, req.user.id)); } catch (err) { next(err); } };
const returnBook = async (req, res, next) => { try { res.json(await chat_service.returnBook(req.params.chatId, req.user.id)); } catch (err) { next(err); } };

module.exports = { listChats, sendFirstMessage, sendMessage, lendBook, returnBook };