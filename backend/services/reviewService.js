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

    const previousCount = Number(book.numberOfReviews || 0);
    const previousAverage = Number(book.avgReviews || 0);
    const nextCount = previousCount + 1;
    const nextAverage = Math.round((((previousAverage * previousCount) + Number(rating)) / nextCount) * 10) / 10;

    book.numberOfReviews = nextCount;
    book.avgReviews = nextAverage;
    await book.save();

    return Review.findById(review._id).populate('reviewer', 'username');
}

async function getReviewsForBook(bookId) {
    if (!mongoose.Types.ObjectId.isValid(bookId)) { throw new Error('invalid book id', 400); }

    const [reviews, book] = await Promise.all([
        Review.find({ book: bookId }).populate('reviewer', 'username').sort({ createdAt: -1 }),
        Book.findById(bookId).select('avgReviews'),
    ]);

    if (!book) throw new Error('book not found', 404);

    return { reviews, avgReviews: Number(book.avgReviews || 0) };
}

module.exports = { createReview, getReviewsForBook };