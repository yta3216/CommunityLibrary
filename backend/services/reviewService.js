const mongoose = require('mongoose');
const Review = require('../models/Review');
const Book = require('../models/Book');

async function createReview({ bookId, reviewerId, rating, comment }) {
    if (!bookId || !mongoose.Types.ObjectId.isValid(bookId)) { throw new Error('valid bookId is required', 400); }
    if (!rating || rating < 1 || rating > 5) { throw new Error('rating must be between 1 and 5', 400); }

    const book = await Book.findById(bookId);
    if (!book) throw new Error('book not found', 404);

    const existing = await Review.findOne({ book: bookId, reviewer: reviewerId });
    if (existing) throw new Error('you already reviewed this book', 409);

    const review = await Review.create({
        book: bookId,
        reviewer: reviewerId,
        rating,
        comment: comment || '',
    });

    await Book.findByIdAndUpdate(bookId, { $inc: { numberOfReviews: 1 } });
    return Review.findById(review._id).populate('reviewer', 'username');
}

async function getReviewsForBook(bookId) {
    if (!mongoose.Types.ObjectId.isValid(bookId)) { throw new Error('invalid book id', 400); }

    const [reviews, avgResult] = await Promise.all([
        Review.find({ book: bookId }).populate('reviewer', 'username').sort({ createdAt: -1 }),
        Review.aggregate([
            { $match: { book: new mongoose.Types.ObjectId(bookId) } },
            { $group: { _id: '$book', avgRating: { $avg: '$rating' } } },
        ]),
    ]);

    const avgRating = avgResult.length > 0 ? Math.round(avgResult[0].avgRating * 10) / 10 : 0;

    return { reviews, avgRating };
}

module.exports = { createReview, getReviewsForBook };