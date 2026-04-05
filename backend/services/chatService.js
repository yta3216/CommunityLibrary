const mongoose = require('mongoose');
const Chat = require('../models/Chat');
const Book = require('../models/Book');

const CHAT_POPULATE = [
    {
        path: 'book',
        select: '_id title isbn owner holder status',
        populate: [
            { path: 'owner', select: '_id username' },
            { path: 'holder', select: '_id username' },
        ],
    },
    { path: 'owner', select: '_id username' },
    { path: 'requester', select: '_id username' },
    { path: 'messages.sender', select: '_id username' },
];

const toIdString = (value) => {
    if (!value) return '';
    if (typeof value === 'object' && value._id) return value._id.toString();
    return value.toString();
};

const isBookAvailable = (bookDoc) => {
    if (!bookDoc) return false;
    const ownerId = toIdString(bookDoc.owner);
    const holderId = toIdString(bookDoc.holder);
    return Boolean(ownerId && holderId && ownerId === holderId);
};

const hasActiveBorrowForIsbn = async ({ userId, isbn, excludeBookId }) => {
    if (!userId || isbn == null) return false;
    const query = { isbn, holder: userId, owner: { $ne: userId } };
    if (excludeBookId) query._id = { $ne: excludeBookId };
    return Boolean(await Book.findOne(query).select('_id'));
};

const toChatDto = (chatDoc, currentUserId) => {
    const ownerId = toIdString(chatDoc.owner);
    const requesterId = toIdString(chatDoc.requester);
    const isOwnerView = ownerId === currentUserId;

    const messages = (chatDoc.messages || []).map((msg) => {
        const senderId = toIdString(msg.sender);
        return {
            id: msg._id,
            senderId,
            senderName: typeof msg.sender === 'object' ? msg.sender.username || '' : '',
            text: msg.text || '',
            createdAt: msg.createdAt,
            isMine: senderId === currentUserId,
        };
    });

    const lastMessage = messages[messages.length - 1] || null;
    const holderId = toIdString(chatDoc.book?.holder);
    const available = isBookAvailable(chatDoc.book);

    return {
        id: chatDoc._id,
        section: isOwnerView ? 'myBooks' : 'theirBooks',
        bookId: chatDoc.book?._id,
        bookTitle: chatDoc.book?.title || 'Untitled',
        bookIsbn: chatDoc.book?.isbn,
        bookStatus: available ? 'available' : 'not_available',
        ownerId,
        ownerName: chatDoc.owner?.username || 'Book owner',
        requesterId,
        requesterName: chatDoc.requester?.username || 'Requester',
        holderId,
        messages,
        lastMessage: lastMessage ? lastMessage.text : '',
        lastMessageAt: lastMessage ? lastMessage.createdAt : chatDoc.updatedAt,
        canLend: isOwnerView && available,
        canReturn: currentUserId === requesterId && holderId === requesterId,
    };
};

const populateChatById = (chatId) => Chat.findById(chatId).populate(CHAT_POPULATE);

async function listChats(userId) {
    const chats = await Chat.find({
        $or: [{ owner: userId }, { requester: userId }],
    }).populate(CHAT_POPULATE).sort({ updatedAt: -1 });

    const result = { myBooks: [], theirBooks: [] };
    chats.forEach((chatDoc) => {
        const dto = toChatDto(chatDoc, userId);
        result[dto.section].push(dto);
    });
    return result;
}

async function sendFirstMessage({ bookId, requesterId, text }) {
    if (!mongoose.Types.ObjectId.isValid(bookId)) {
        throw new Error('invalid book id', 400);
    }

    const normalizedText = String(text || '').trim();
    if (!normalizedText) throw new Error('message text is required', 400);

    const book = await Book.findById(bookId)
        .populate('owner', '_id username')
        .populate('holder', '_id username');
    if (!book) throw new Error('book not found', 404);

    const ownerId = toIdString(book.owner);
    if (ownerId === requesterId) {
        throw new Error('owners cannot borrow their own book', 409);
    }

    let chat = await Chat.findOne({ book: book._id, owner: ownerId, requester: requesterId });

    if (!chat && !isBookAvailable(book)) {
        throw new Error('book is not available for new borrow requests', 409);
    }

    if (!chat) {
        const alreadyBorrowing = await hasActiveBorrowForIsbn({
            userId: requesterId,
            isbn: book.isbn,
            excludeBookId: book._id,
        });
        if (alreadyBorrowing) {
            throw new Error('you are already borrowing another copy with this ISBN', 409);
        }
    }

    const isCreated = !chat;

    if (!chat) {
        chat = new Chat({ book: book._id, owner: ownerId, requester: requesterId, messages: [] });
    }

    chat.messages.push({ sender: requesterId, text: normalizedText });

    try {
        await chat.save();
    } catch (err) {
        // Race condition: the chat was created between our lookup and our save.
        // Recover by appending to whichever chat won the race.
        if (err.code === 11000) {
            const existing = await Chat.findOne({ book: book._id, requester: requesterId });
            if (existing) {
                existing.messages.push({ sender: requesterId, text: normalizedText });
                await existing.save();
                const populated = await populateChatById(existing._id);
                return { chat: toChatDto(populated, requesterId), isCreated: false };
            }
            throw new Error('chat already exists for this book request', 409);
        }
        throw err;
    }

    const populated = await populateChatById(chat._id);
    return { chat: toChatDto(populated, requesterId), isCreated };
}

async function sendMessage(chatId, senderId, text) {
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
        throw new Error('invalid chat id', 400);
    }

    const normalizedText = String(text || '').trim();
    if (!normalizedText) throw new Error('message text is required', 400);

    const chat = await Chat.findById(chatId);
    if (!chat) throw new Error('chat not found', 404);

    const isParticipant =
        senderId === chat.owner.toString() || senderId === chat.requester.toString();
    if (!isParticipant) throw new Error('only chat participants can send messages', 403);

    chat.messages.push({ sender: senderId, text: normalizedText });
    await chat.save();

    const populated = await populateChatById(chat._id);
    return toChatDto(populated, senderId);
}

async function lendBook(chatId, actorId) {
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
        throw new Error('invalid chat id', 400);
    }

    const chat = await Chat.findById(chatId).populate({
        path: 'book', select: '_id isbn owner holder',
    });
    if (!chat) throw new Error('chat not found', 404);
    if (!chat.book) throw new Error('book not found', 404);

    if (actorId !== chat.owner.toString()) {
        throw new Error('only the book owner can lend through this chat', 403);
    }

    const requesterId = chat.requester.toString();
    const holderId = toIdString(chat.book.holder);

    if (holderId && holderId !== chat.owner.toString() && holderId !== requesterId) {
        throw new Error('book is currently lent to another user', 409);
    }

    const alreadyBorrowing = await hasActiveBorrowForIsbn({
        userId: requesterId,
        isbn: chat.book.isbn,
        excludeBookId: chat.book._id,
    });
    if (alreadyBorrowing) {
        throw new Error('requester is already borrowing another copy with this ISBN', 409);
    }

    chat.book.holder = requesterId;
    await chat.book.save();

    const populated = await populateChatById(chat._id);
    return toChatDto(populated, actorId);
}

async function returnBook(chatId, actorId) {
    if (!mongoose.Types.ObjectId.isValid(chatId)) {
        throw new Error('invalid chat id', 400);
    }

    const chat = await Chat.findById(chatId).populate({
        path: 'book', select: '_id owner holder',
    });
    if (!chat) throw new Error('chat not found', 404);
    if (!chat.book) throw new Error('book not found', 404);

    const ownerId = toIdString(chat.book.owner);
    const requesterId = chat.requester.toString();
    const holderId = toIdString(chat.book.holder);

    const requesterCanReturn = actorId === requesterId && holderId === requesterId;
    const ownerCanMarkAvailable = actorId === ownerId && holderId !== ownerId;

    if (!requesterCanReturn && !ownerCanMarkAvailable) {
        throw new Error('you cannot return this book from the current state', 403);
    }

    chat.book.holder = ownerId;
    await chat.book.save();

    const populated = await populateChatById(chat._id);
    return toChatDto(populated, actorId);
}

module.exports = { listChats, sendFirstMessage, sendMessage, lendBook, returnBook };