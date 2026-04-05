const book_service = require('../services/book_service');

const createBook = async (req, res, next) => {
    try {
        res.status(201).json(await book_service.createBook(req.body, req.user.id));
    } catch (err) { next(err); }
};

const listBooks = async (req, res, next) => {
    try {
        res.json(await book_service.listBooks(req.query.q));
    } catch (err) { next(err); }
};

const getPopularBooks = async (req, res, next) => {
    try {
        res.json(await book_service.getPopularBooks(req.query.q));
    } catch (err) { next(err); }
};

const getBook = async (req, res, next) => {
    try {
        res.json(await book_service.getBookDetail(req.params.id, req.user.id));
    } catch (err) { next(err); }
};

const updateBook = async (req, res, next) => {
    try {
        res.json(await book_service.updateBook(req.params.id, req.user.id, req.body));
    } catch (err) { next(err); }
};

const deleteBook = async (req, res, next) => {
    try {
        await book_service.deleteBook(req.params.id, req.user);
        res.json({ message: 'book deleted' });
    } catch (err) { next(err); }
};

const returnBook = async (req, res, next) => {
    try {
        res.json(await book_service.returnBook(req.params.id, req.user.id));
    } catch (err) { next(err); }
};

const toggleBookStatus = async (req, res, next) => {
    try {
        res.json(await book_service.toggleBookStatus(req.params.id, req.user.id));
    } catch (err) { next(err); }
};

module.exports = { createBook, listBooks, getPopularBooks, getBook, updateBook, deleteBook, returnBook, toggleBookStatus };