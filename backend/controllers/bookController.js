const bookService = require('../services/bookService');

const createBook = async (req, res, next) => {
    try {
        res.status(201).json(await bookService.createBook(req.body, req.user.id));
    } catch (err) { next(err); }
};

const listBooks = async (req, res, next) => {
    try {
        res.json(await bookService.listBooks(req.query.q));
    } catch (err) { next(err); }
};

const getPopularBooks = async (req, res, next) => {
    try {
        res.json(await bookService.getPopularBooks(req.query.q));
    } catch (err) { next(err); }
};

// Book by specific id actions
const getBook = async (req, res, next) => {
    try {
        res.json(await bookService.getBookDetail(req.params.id, req.user.id));
    } catch (err) { next(err); }
};

const updateBook = async (req, res, next) => {
    try {
        res.json(await bookService.updateBook(req.params.id, req.user, req.body));
    } catch (err) { next(err); }
};

const deleteBook = async (req, res, next) => {
    try {
        await bookService.deleteBook(req.params.id, req.user);
        res.json({ message: 'book deleted' });
    } catch (err) { next(err); }
};

// Admin actions
const returnBook = async (req, res, next) => {
    try {
        res.json(await bookService.returnBook(req.params.id, req.user.id));
    } catch (err) { next(err); }
};

const toggleBookStatus = async (req, res, next) => {
    try {
        res.json(await bookService.toggleBookStatus(req.params.id, req.user.id));
    } catch (err) { next(err); }
};

module.exports = { createBook, listBooks, getPopularBooks, getBook, updateBook, deleteBook, returnBook, toggleBookStatus };