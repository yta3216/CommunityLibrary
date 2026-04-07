const mongoose = require('mongoose');
const Book = require('../models/Book');
const User = require('../models/User');
const Chat = require('../models/Chat');
const sse = require('./sseService');
const BOOK_POPULATE = [
    { path: 'owner', select: '_id username email role status description' },
    { path: 'holder', select: '_id username email role status description' },
];

const normalizeStr = (v) => String(v || '').trim();

async function createBook({ isbn, title, author, genre, description }, ownerId) {
    const fields = {
        isbn: normalizeStr(isbn),
        title: normalizeStr(title),
        author: normalizeStr(author),
        genre: normalizeStr(genre),
        description: normalizeStr(description),
    };

    if (!fields.isbn || !fields.title || !fields.author || !fields.genre || !fields.description) {
        throw new Error('isbn, title, author, genre, and description are required', 400);
    }

    if (!mongoose.Types.ObjectId.isValid(ownerId)) {
        throw new Error('invalid authenticated user', 401);
    }

    const owner = await User.findById(ownerId);
    if (!owner) throw new Error('authenticated user not found', 404);

    const created = await Book.create({ ...fields, owner: owner._id, holder: owner._id, ownerLocked: false });
    const book = await Book.findById(created._id).populate(BOOK_POPULATE);
    
    const bookListing = await Book.findById(created._id).populate(LIST_POPULATE);
    await sse.emitBookCreated(bookListing._id);

    return book;
}

async function listBooks(query) {
    const q = normalizeStr(query);
    const filter = q ? {
    $or: [
        { title: { $regex: q, $options: 'i' } },
        { author: { $regex: q, $options: 'i' } },
        { genre: { $regex: q, $options: 'i' } },
    ]
    } : {};

    const books = await Book.find(filter)
        .populate('owner', '_id username email role')
        .populate('holder', '_id username email role')
        .sort({ createdAt: -1 });

    return books.map((book) => ({
        ...book.toObject(),
        avgReviews: Number(book.avgReviews || 0),
        numberOfReviews: Number(book.numberOfReviews || 0),
    }));
}

async function getPopularBooks(query) {
    const q = normalizeStr(query);
    const filter = {
        ...(q ? { title: { $regex: q, $options: 'i' } } : {}),
        numberOfReviews: { $gte: 1 },
    };

    const books = await Book.find(filter)
        .populate('owner', '_id username email role')
        .populate('holder', '_id username email role')
        .sort({ avgReviews: -1, numberOfReviews: -1, createdAt: -1 })
        .limit(5);

    return books.map((book) => ({
        ...book.toObject(),
        avgReviews: Number(book.avgReviews || 0),
        numberOfReviews: Number(book.numberOfReviews || 0),
    }));
}

async function getBookDetail(bookId, currentUserId) {
    if (!mongoose.Types.ObjectId.isValid(bookId)) {
        throw new Error('invalid book id', 400);
    }

    const book = await Book.findById(bookId)
        .populate('owner', 'username')
        .populate('holder', 'username');

    if (!book) throw new Error('book not found', 404);

    const ownerId = book.owner._id.toString();
    const holderId = book.holder._id.toString();

    const [ownsCopy, holdsBorrowedCopy, existingChat] = await Promise.all([
        Book.exists({ isbn: book.isbn, owner: currentUserId }),
        Book.exists({ isbn: book.isbn, holder: currentUserId, owner: { $ne: currentUserId } }),
        Chat.findOne({ book: book._id, requester: currentUserId }).select('_id'),
    ]);

    const isCurrentOwner = currentUserId === ownerId;
    const isCurrentHolder = currentUserId === holderId && currentUserId !== ownerId;
    const isBookAvailable = book.status === 'available';
    const hasExistingChat = Boolean(existingChat);
    const existingChatId = existingChat ? existingChat._id.toString() : null;

    const canBorrow = Boolean(
        !isCurrentOwner && !ownsCopy && !holdsBorrowedCopy &&
        isBookAvailable && !hasExistingChat && !isCurrentHolder
    );

    const showBorrowButton = Boolean(
        !isCurrentHolder && (ownsCopy || holdsBorrowedCopy || !hasExistingChat)
    );

    const showViewConversationButton = Boolean(
        !isCurrentHolder && !ownsCopy && hasExistingChat
    );

    let actionHintText = '';
    if (isCurrentOwner) actionHintText = 'You are the owner of this book.';
    else if (ownsCopy) actionHintText = 'You already own a copy of this book.';
    else if (holdsBorrowedCopy) actionHintText = 'You are already borrowing another copy with this ISBN.';
    else if (showViewConversationButton) actionHintText = 'You already started a conversation for this listing.';
    else if (!isBookAvailable && !isCurrentHolder) actionHintText = 'This listing is currently not available for borrowing.';

    const genres = (book.genre || '').split(',').map((g) => g.trim()).filter(Boolean);

    return {
        id: book._id,
        isbn: book.isbn,
        title: book.title,
        author: book.author,
        description: book.description,
        status: book.status,
        ownerLocked: book.ownerLocked,
        genres: genres.length > 0 ? genres : ['Unknown'],
        ownerName: book.owner?.username || 'Unknown',
        ownerId,
        holderId,
        numberOfReviews: book.numberOfReviews,
        existingChatId,
        canBorrow,
        canReturn: isCurrentHolder,
        showBorrowButton,
        showViewConversationButton,
        actionHintText,
        isCurrentOwner,
        isCurrentHolder,
    };
}

async function updateBook(bookId, actor, fields) {
    if (!mongoose.Types.ObjectId.isValid(bookId)) {
        throw new Error('invalid book id', 400);
    }
 
    const book = await Book.findById(bookId);
    if (!book) throw new Error('book not found', 404);
 
    const actorId = typeof actor === 'object' ? actor.id : actor;
    const isAdmin = typeof actor === 'object' && actor.role === 'admin';
    if (!isAdmin && book.owner.toString() !== actorId) throw new Error('forbidden', 403);
 
    const { isbn, title, author, genre, description } = fields;
 
    if (isbn !== undefined) {
        const normalized = normalizeStr(isbn);
        const parsed = Number(normalized);
        if (!normalized || Number.isNaN(parsed)) throw new Error('valid isbn is required', 400);
        book.isbn = parsed;
    }

    if (title !== undefined) book.title = normalizeStr(title);
    if (author !== undefined) book.author = normalizeStr(author);
    if (genre !== undefined) book.genre = normalizeStr(genre);
    if (description !== undefined) book.description = normalizeStr(description);

    await book.save();
    const updated = await Book.findById(book._id).populate(BOOK_POPULATE);
    await sse.emitBookUpdated(book._id);
    return updated;
}

async function deleteBook(bookId, actor) {
    if (!mongoose.Types.ObjectId.isValid(bookId)) {
        throw new Error('invalid book id', 400);
    }

    const book = await Book.findById(bookId);
    if (!book) throw new Error('book not found', 404);

    const isOwner = book.owner.toString() === actor.id;
    const isAdmin = actor.role === 'admin';
    if (!isOwner && !isAdmin) throw new Error('forbidden', 403);

    await Book.findByIdAndDelete(bookId);

    sse.emitBookDeleted(bookId);
}

async function returnBook(bookId, actorId) {
    if (!mongoose.Types.ObjectId.isValid(bookId)) {
        throw new Error('invalid book id', 400);
    }

    const book = await Book.findById(bookId);
    if (!book) throw new Error('book not found', 404);

    const ownerId = book.owner.toString();
    const holderId = book.holder.toString();

    const requesterCanReturn = actorId === holderId && actorId !== ownerId;
    const ownerCanMarkAvailable = actorId === ownerId && holderId !== ownerId;

    if (!requesterCanReturn && !ownerCanMarkAvailable) {
        throw new Error('you cannot return this book from the current state', 400);
    }

    book.holder = book.owner;
    book.ownerLocked = false;
    await book.save();
    const updated = await Book.findById(book._id).populate(BOOK_POPULATE);
    await sse.emitBookUpdated(book._id);
    return updated;
}

async function toggleBookStatus(bookId, adminId) {
    if (!mongoose.Types.ObjectId.isValid(bookId)) {
        throw new Error('invalid book id', 400);
    }

    const book = await Book.findById(bookId);
    if (!book) throw new Error('book not found', 404);

    if (book.status === 'available') {
        if (adminId === book.owner.toString()) {
            throw new Error('admin cannot toggle availability of their own book', 409);
        }
        book.holder = adminId;
    } else {
        book.holder = book.owner;
        book.ownerLocked = false;
    }

    await book.save();
    const updated = await Book.findById(book._id)
        .populate('owner', '_id username')
        .populate('holder', '_id username');
    await sse.emitBookUpdated(book._id);
    return updated;
}

async function setAvailability(bookId, ownerId, makeAvailable) {
    if (!mongoose.Types.ObjectId.isValid(bookId)) {
        throw new Error('invalid book id', 400);
    }

    const book = await Book.findById(bookId);
    if (!book) throw new Error('book not found', 404);
    if (book.owner.toString() !== ownerId) throw new Error('forbidden', 403);

    const isLentOut = book.holder.toString() !== ownerId;
    if (isLentOut) {
        throw new Error('cannot change availability while book is lent out', 409);
    }

    book.ownerLocked = !makeAvailable;
    await book.save();
    const updated = await Book.findById(book._id).populate(BOOK_POPULATE);
    await sse.emitBookUpdated(book._id);
    return updated;
}
 
module.exports = {
    BOOK_POPULATE,
    createBook,
    listBooks,
    getPopularBooks,
    getBookDetail,
    updateBook,
    deleteBook,
    returnBook,
    toggleBookStatus,
    setAvailability,
};