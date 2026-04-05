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

module.exports = { createReview, getReviews };