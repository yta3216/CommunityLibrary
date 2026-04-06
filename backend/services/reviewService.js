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

// Admin functions
async function getReviewsByUser(userId) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new Error('invalid user id', 400);
    }
 
    const reviews = await Review.find({ reviewer: userId })
        .populate({ path: 'book', select: 'title owner', populate: { path: 'owner', select: 'username' } })
        .sort({ createdAt: -1 });
 
    return reviews;
}

async function deleteReview(reviewId) {
    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
        throw new Error('invalid review id', 400);
    }
 
    const review = await Review.findById(reviewId);
    if (!review) throw new Error('review not found', 404);
 
    const book = await Book.findById(review.book);
 
    await Review.findByIdAndDelete(reviewId);
 
    if (book) {
        const previousCount = Number(book.numberOfReviews || 0);
        const previousAverage = Number(book.avgReviews || 0);
        const nextCount = Math.max(0, previousCount - 1);
 
        let nextAverage = 0;
        if (nextCount > 0) {
            nextAverage = Math.round(
                (((previousAverage * previousCount) - Number(review.rating)) / nextCount) * 10
            ) / 10;
        }
 
        book.numberOfReviews = nextCount;
        book.avgReviews = nextAverage;
        await book.save();
    }
}
async function getAllReviews() {
    const reviews = await Review.find()
        .populate('reviewer', 'username')
        .populate('book', 'title')
        .sort({ createdAt: -1 });
    return reviews;
}
module.exports = { createReview, getReviewsForBook, getReviewsByUser, deleteReview, getAllReviews };