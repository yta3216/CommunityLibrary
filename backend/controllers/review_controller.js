const review_service = require('../services/review_service');

const createReview = async (req, res, next) => {
    try {
        res.status(201).json(await review_service.createReview({ ...req.body, reviewerId: req.user.id }));
    } catch (err) { next(err); }
};

const getReviews = async (req, res, next) => {
    try {
        res.json(await review_service.getReviewsForBook(req.params.bookId));
    } catch (err) { next(err); }
};

module.exports = { createReview, getReviews };