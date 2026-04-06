const reviewService = require('../services/reviewService');

const createReview = async (req, res, next) => {
    try {
        res.status(201).json(await reviewService.createReview({ ...req.body, reviewerId: req.user.id }));
    } catch (err) { next(err); }
};

const getReviews = async (req, res, next) => {
    try {
        res.json(await reviewService.getReviewsForBook(req.params.bookId));
    } catch (err) { next(err); }
};

const getMyReviews = async (req, res, next) => {
    try {
        res.json(await reviewService.getReviewsByUser(req.user.id));
    } catch (err) { next(err); }
};

// Admin functions
const getReviewsByUser = async (req, res, next) => {
    try {
        res.json(await reviewService.getReviewsByUser(req.params.userId));
    } catch (err) { next(err); }
};

const deleteReview = async (req, res, next) => {
    try {
        await reviewService.deleteReview(req.params.reviewId);
        res.json({ message: 'review deleted' });
    } catch (err) { next(err); }
};

const getAllReviews = async (req, res, next) => {
    try {
        res.json(await reviewService.getAllReviews());
    } catch (err) { next(err); }
};

module.exports = { createReview, getReviews, getReviewsByUser, deleteReview, getAllReviews, getMyReviews };