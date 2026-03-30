const express = require("express");
const mongoose = require("mongoose");

const Chat = require("../models/Chat");
const Book = require("../models/Book");
const { authRequired } = require("../middleware/auth");

const router = express.Router();

const CHAT_POPULATE = [
  {
    path: "book",
    select: "_id title isbn owner holder status",
    populate: [
      { path: "owner", select: "_id username" },
      { path: "holder", select: "_id username" },
    ],
  },
  { path: "owner", select: "_id username" },
  { path: "requester", select: "_id username" },
  { path: "messages.sender", select: "_id username" },
];

const toIdString = (value) => {
  if (!value) {
    return "";
  }

  if (typeof value === "object" && value._id) {
    return value._id.toString();
  }

  return value.toString();
};

const isBookAvailable = (bookDoc) => {
  if (!bookDoc) {
    return false;
  }

  const ownerId = toIdString(bookDoc.owner);
  const holderId = toIdString(bookDoc.holder);
  return Boolean(ownerId && holderId && ownerId === holderId);
};

const hasActiveBorrowForIsbn = async ({ userId, isbn, excludeBookId }) => {
  if (!userId || typeof isbn === "undefined" || isbn === null) {
    return false;
  }

  const query = {
    isbn,
    holder: userId,
    owner: { $ne: userId },
  };

  if (excludeBookId) {
    query._id = { $ne: excludeBookId };
  }

  const borrowedBook = await Book.findOne(query).select("_id");
  return Boolean(borrowedBook);
};

const toChatDto = (chatDoc, currentUserId) => {
  const ownerId = toIdString(chatDoc.owner);
  const requesterId = toIdString(chatDoc.requester);

  const isOwnerView = ownerId === currentUserId;

  const messages = (chatDoc.messages || []).map((message) => {
    const senderId = toIdString(message.sender);

    return {
      id: message._id,
      senderId,
      senderName:
        typeof message.sender === "object" ? message.sender.username || "" : "",
      text: message.text || "",
      createdAt: message.createdAt,
      isMine: senderId === currentUserId,
    };
  });

  const lastMessage = messages[messages.length - 1] || null;

  const holderId = toIdString(chatDoc.book?.holder);
  const bookOwnerId = toIdString(chatDoc.book?.owner) || ownerId;
  const available = isBookAvailable(chatDoc.book);

  const canLend = isOwnerView && available;
  const canReturn =
    (currentUserId === requesterId && holderId === requesterId);

  return {
    id: chatDoc._id,
    section: isOwnerView ? "myBooks" : "theirBooks",
    bookId: chatDoc.book?._id,
    bookTitle: chatDoc.book?.title || "Untitled",
    bookIsbn: chatDoc.book?.isbn,
    bookStatus: available ? "available" : "not_available",
    ownerId,
    ownerName: chatDoc.owner?.username || "Book owner",
    requesterId,
    requesterName: chatDoc.requester?.username || "Requester",
    holderId,
    messages,
    lastMessage: lastMessage ? lastMessage.text : "",
    lastMessageAt: lastMessage ? lastMessage.createdAt : chatDoc.updatedAt,
    canLend,
    canReturn,
  };
};

const populateChatById = async (chatId) => {
  return Chat.findById(chatId).populate(CHAT_POPULATE);
};

router.get("/", authRequired, async (req, res) => {
  try {
    const chats = await Chat.find({
      $or: [{ owner: req.user.id }, { requester: req.user.id }],
    })
      .populate(CHAT_POPULATE)
      .sort({ updatedAt: -1 });

    const result = { myBooks: [], theirBooks: [] };

    chats.forEach((chatDoc) => {
      const dto = toChatDto(chatDoc, req.user.id);
      result[dto.section].push(dto);
    });

    return res.json(result);
  } catch (error) {
    return res.status(500).json({ message: "failed to fetch chats", detail: error.message });
  }
});

router.post("/messages", authRequired, async (req, res) => {
  try {
    const { bookId, text } = req.body;
    const normalizedText = String(text || "").trim();

    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      return res.status(400).json({ message: "invalid book id" });
    }

    if (!normalizedText) {
      return res.status(400).json({ message: "message text is required" });
    }

    const book = await Book.findById(bookId).populate("owner", "_id username").populate("holder", "_id username");
    if (!book) {
      return res.status(404).json({ message: "book not found" });
    }

    const ownerId = toIdString(book.owner);
    const requesterId = req.user.id;

    if (ownerId === requesterId) {
      return res.status(409).json({ message: "owners cannot borrow their own book" });
    }

    let chat = await Chat.findOne({
      book: book._id,
      owner: ownerId,
      requester: requesterId,
    });

    const bookAvailable = isBookAvailable(book);

    if (!chat && !bookAvailable) {
      return res.status(409).json({ message: "book is not available for new borrow requests" });
    }

    if (!chat) {
      const alreadyBorrowingSameIsbn = await hasActiveBorrowForIsbn({
        userId: requesterId,
        isbn: book.isbn,
        excludeBookId: book._id,
      });

      if (alreadyBorrowingSameIsbn) {
        return res.status(409).json({ message: "you are already borrowing another copy with this ISBN" });
      }
    }

    const isCreated = !chat;

    if (!chat) {
      chat = new Chat({
        book: book._id,
        owner: ownerId,
        requester: requesterId,
        messages: [],
      });
    }

    chat.messages.push({
      sender: requesterId,
      text: normalizedText,
    });

    await chat.save();

    const populatedChat = await populateChatById(chat._id);
    return res.status(isCreated ? 201 : 200).json(toChatDto(populatedChat, req.user.id));
  } catch (error) {
    if (error.code === 11000) {
      const duplicateBookId = req.body?.bookId;
      const duplicateText = String(req.body?.text || "").trim();

      // If a chat already exists for this requester + listing, append into that thread.
      const existingChat = await Chat.findOne({
        book: duplicateBookId,
        requester: req.user.id,
      });

      if (existingChat && duplicateText) {
        existingChat.messages.push({
          sender: req.user.id,
          text: duplicateText,
        });

        await existingChat.save();

        const populatedChat = await populateChatById(existingChat._id);
        return res.json(toChatDto(populatedChat, req.user.id));
      }

      return res.status(409).json({ message: "chat already exists for this book request" });
    }

    return res.status(500).json({ message: "failed to send message", detail: error.message });
  }
});

router.post("/:chatId/messages", authRequired, async (req, res) => {
  try {
    const { chatId } = req.params;
    const { text } = req.body;

    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ message: "invalid chat id" });
    }

    const normalizedText = String(text || "").trim();
    if (!normalizedText) {
      return res.status(400).json({ message: "message text is required" });
    }

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: "chat not found" });
    }

    const ownerId = chat.owner.toString();
    const requesterId = chat.requester.toString();
    const senderId = req.user.id;

    const isParticipant = senderId === ownerId || senderId === requesterId;
    if (!isParticipant) {
      return res.status(403).json({ message: "only chat participants can send messages" });
    }

    chat.messages.push({
      sender: senderId,
      text: normalizedText,
    });

    await chat.save();

    const populatedChat = await populateChatById(chat._id);
    return res.json(toChatDto(populatedChat, senderId));
  } catch (error) {
    return res.status(500).json({ message: "failed to append message", detail: error.message });
  }
});

router.patch("/:chatId/lend", authRequired, async (req, res) => {
  try {
    const { chatId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ message: "invalid chat id" });
    }

    const chat = await Chat.findById(chatId).populate({
      path: "book",
      select: "_id isbn owner holder",
    });

    if (!chat) {
      return res.status(404).json({ message: "chat not found" });
    }

    const ownerId = chat.owner.toString();
    const requesterId = chat.requester.toString();

    if (req.user.id !== ownerId) {
      return res.status(403).json({ message: "only the book owner can lend through this chat" });
    }

    if (!chat.book) {
      return res.status(404).json({ message: "book not found" });
    }

    const holderId = toIdString(chat.book.holder);
    if (holderId && holderId !== ownerId && holderId !== requesterId) {
      return res.status(409).json({ message: "book is currently lent to another user" });
    }

    const alreadyBorrowingSameIsbn = await hasActiveBorrowForIsbn({
      userId: requesterId,
      isbn: chat.book.isbn,
      excludeBookId: chat.book._id,
    });

    if (alreadyBorrowingSameIsbn) {
      return res.status(409).json({ message: "requester is already borrowing another copy with this ISBN" });
    }

    chat.book.holder = requesterId;
    await chat.book.save();

    const populatedChat = await populateChatById(chat._id);
    return res.json(toChatDto(populatedChat, req.user.id));
  } catch (error) {
    return res.status(500).json({ message: "failed to lend book", detail: error.message });
  }
});

router.patch("/:chatId/return", authRequired, async (req, res) => {
  try {
    const { chatId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({ message: "invalid chat id" });
    }

    const chat = await Chat.findById(chatId).populate({
      path: "book",
      select: "_id owner holder",
    });

    if (!chat) {
      return res.status(404).json({ message: "chat not found" });
    }

    if (!chat.book) {
      return res.status(404).json({ message: "book not found" });
    }

    const ownerId = toIdString(chat.book.owner);
    const requesterId = chat.requester.toString();
    const holderId = toIdString(chat.book.holder);
    const actorId = req.user.id;

    const requesterCanReturn = actorId === requesterId && holderId === requesterId;
    const ownerCanMarkAvailable = actorId === ownerId && holderId !== ownerId;

    if (!requesterCanReturn && !ownerCanMarkAvailable) {
      return res.status(403).json({ message: "you cannot return this book from the current state" });
    }

    chat.book.holder = ownerId;
    await chat.book.save();

    const populatedChat = await populateChatById(chat._id);
    return res.json(toChatDto(populatedChat, actorId));
  } catch (error) {
    return res.status(500).json({ message: "failed to return book", detail: error.message });
  }
});

module.exports = router;
