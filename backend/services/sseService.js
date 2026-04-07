const Book = require('../models/Book');
const sse = require('../sseManager');

const LIST_POPULATE = [
    { path: 'owner', select: '_id username email role' },
    { path: 'holder', select: '_id username email role' },
];

function toListPayload(book) {
    return {
        ...book.toObject(),
        avgReviews: Number(book.avgReviews || 0),
        numberOfReviews: Number(book.numberOfReviews || 0),
    };
}

async function emitBookUpdated(bookId) {
    const book = await Book.findById(bookId).populate(LIST_POPULATE);
    if (!book) return;
    const payload = toListPayload(book);
    sse.emit('books', 'book:updated', payload);
    sse.emit(`book:${bookId}`, 'book:updated', { id: String(bookId) });
}

function emitBookDeleted(bookId) {
    const id = String(bookId);
    sse.emit('books', 'book:deleted', { id });
    sse.emit(`book:${bookId}`, 'book:deleted', { id });
}

async function emitBookCreated(bookId) {
    const book = await Book.findById(bookId).populate(LIST_POPULATE);
    if (!book) return;
    sse.emit('books', 'book:created', toListPayload(book));
}

function emitReviewCreated(bookId, review, avgReviews, numberOfReviews) {
    sse.emit(`book:${bookId}`, 'review:created', { review, avgReviews, numberOfReviews });
    sse.emit('books', 'book:updated', {
        _id: String(bookId),
        avgReviews,
        numberOfReviews,
    });
}

function emitReviewDeleted(bookId, reviewId, avgReviews, numberOfReviews) {
    sse.emit(`book:${bookId}`, 'review:deleted', { reviewId: String(reviewId), avgReviews, numberOfReviews });
    sse.emit('books', 'book:updated', {
        _id: String(bookId),
        avgReviews,
        numberOfReviews,
    });
}

function emitChatUpdated(ownerId, ownerDto, requesterId, requesterDto) {
    sse.emit(`chat:${ownerId}`, 'chat:updated', ownerDto);
    sse.emit(`chat:${requesterId}`, 'chat:updated', requesterDto);
}

module.exports = {
    emitBookCreated,
    emitBookUpdated,
    emitBookDeleted,
    emitReviewCreated,
    emitReviewDeleted,
    emitChatUpdated,
};