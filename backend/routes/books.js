// load express router, mongodb id checks, models, and auth middleware
const express = require("express");
const mongoose = require("mongoose");

const Chat = require("../models/Chat");
const Book = require("../models/Book");
const User = require("../models/User");
const Review = require("../models/Review");
const { authRequired, requireRole } = require("../middleware/auth");

const router = express.Router();

const normalizeQuery = (value) => String(value || "").trim();

// create book: logged-in user becomes both owner and current holder at start
router.post("/", authRequired, async (req, res) => {
  try {
    const { isbn, title, author, genre, description } = req.body;

    // normalize inputs to avoid null/undefined and remove extra spaces
    const normalizedIsbn = String(isbn || "").trim();
    const normalizedTitle = String(title || "").trim();
    const normalizedAuthor = String(author || "").trim();
    const normalizedGenre = String(genre || "").trim();
    const normalizedDescription = String(description || "").trim();

    // all core fields are required to create a valid book record
    if (
      !normalizedIsbn ||
      !normalizedTitle ||
      !normalizedAuthor ||
      !normalizedGenre ||
      !normalizedDescription
    ) {
      return res.status(400).json({
        message: "isbn, title, author, genre, description are required",
      });
    }

    // token should already give valid user id, but this is an extra guard
    if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
      return res.status(401).json({ message: "invalid authenticated user" });
    }

    // make sure authenticated user actually exists in database
    const ownerUser = await User.findById(req.user.id);
    if (!ownerUser) {
      return res.status(404).json({ message: "authenticated user not found" });
    }

    const ownerId = ownerUser._id;

    // create book with owner=holder so new book starts as available
    const createdBook = await Book.create({
      isbn: normalizedIsbn,
      title: normalizedTitle,
      author: normalizedAuthor,
      genre: normalizedGenre,
      owner: ownerId,
      holder: ownerId,
      description: normalizedDescription,
    });

    // re-fetch with populated owner/holder so create-book returns full user data, not just ids
    const populatedBook = await Book.findById(createdBook._id)
      .populate("owner", "_id username email role status description")
      .populate("holder", "_id username email role status description");

    return res.status(201).json(populatedBook);
  } catch (error) {
    console.error("create book error:", error);

    // schema-level validation errors return 400 instead of generic 500
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }

    return res.status(500).json({
      message: "failed to create book",
      detail: error.message,
    });
  }
});
// Popular book endpoints
router.get("/popular", async (req, res) => {
  try {
    const normalizedQuery = normalizeQuery(req.query.q);

    const popular = await Review.aggregate([
      {
        $group: {
          _id: "$book",
          avgRating: { $avg: "$rating" },
          numberOfReviews: { $sum: 1 },
        },
      },
      { $match: { numberOfReviews: { $gte: 1 } } },
      { $sort: { avgRating: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "books",
          localField: "_id",
          foreignField: "_id",
          as: "bookData",
        },
      },
      { $unwind: "$bookData" },
      {
        $lookup: {
          from: "users",
          localField: "bookData.owner",
          foreignField: "_id",
          as: "bookData.owner",
        },
      },
      { $unwind: "$bookData.owner" },
      ...(normalizedQuery
        ? [{ $match: { "bookData.title": { $regex: normalizedQuery, $options: "i" } } }]
        : []),
      { $sort: { avgRating: -1 } },
      { $limit: 5 },
    ]);

    return res.json(popular);
  } catch (error) {
    console.error("popular books error:", error);
    return res.status(500).json({ message: "failed to fetch popular books" });
  }
});


router.get("/:id", authRequired, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
      .populate("owner", "username")
      .populate("holder", "username");

    if (!book) {
      return res.status(404).json({ message: "Book not found." });
    }

    const currentUserId = req.user.id.toString();
    const ownerId = book.owner._id.toString();
    const holderId = book.holder._id.toString();

    const ownsCopyWithSameIsbn = await Book.exists({
      isbn: book.isbn,
      owner: currentUserId,
    });

    const holdsBorrowedCopyWithSameIsbn = await Book.exists({
      isbn: book.isbn,
      holder: currentUserId,
      owner: { $ne: currentUserId },
    });

    const existingChat = await Chat.findOne({
      book: book._id,
      requester: currentUserId,
    }).select("_id");

    const existingChatId = existingChat ? existingChat._id.toString() : null;

    const isCurrentOwner = currentUserId === ownerId;
    const isCurrentHolder = currentUserId === holderId && currentUserId !== ownerId;
    const isBookAvailable = book.status === "available";
    const hasExistingConversation = Boolean(existingChatId);

    const canBorrow = Boolean(
      !isCurrentOwner &&
      !ownsCopyWithSameIsbn &&
      !holdsBorrowedCopyWithSameIsbn &&
      isBookAvailable &&
      !hasExistingConversation &&
      !isCurrentHolder,
    );

    const canReturn = isCurrentHolder;

    const showBorrowButton = Boolean(
      !isCurrentHolder &&
      (ownsCopyWithSameIsbn ||
        holdsBorrowedCopyWithSameIsbn ||
        !hasExistingConversation),
    );

    const showViewConversationButton = Boolean(
      !isCurrentHolder && !ownsCopyWithSameIsbn && hasExistingConversation,
    );

    let actionHintText = "";
    if (isCurrentOwner) {
      actionHintText = "You are the owner of this book.";
    } else if (ownsCopyWithSameIsbn) {
      actionHintText = "You already own a copy of this book.";
    } else if (holdsBorrowedCopyWithSameIsbn) {
      actionHintText = "You are already borrowing another copy with this ISBN.";
    } else if (showViewConversationButton) {
      actionHintText = "You already started a conversation for this listing.";
    } else if (!isBookAvailable && !isCurrentHolder) {
      actionHintText = "This listing is currently not available for borrowing.";
    }

    const genres = (book.genre || "")
      .split(",")
      .map((g) => g.trim())
      .filter(Boolean);

    res.json({
      id: book._id,
      isbn: book.isbn,
      title: book.title,
      author: book.author,
      description: book.description,
      status: book.status,
      genres: genres.length > 0 ? genres : ["Unknown"],
      ownerName: book.owner?.username || "Unknown",
      ownerId,
      holderId,
      numberOfReviews: book.numberOfReviews,
      existingChatId,
      canBorrow,
      canReturn,
      showBorrowButton,
      showViewConversationButton,
      actionHintText,
      isCurrentOwner,
      isCurrentHolder,
    });
  } catch (error) {
    res.status(500).json({ message: "Could not load book details." });
  }
});

// list all books with lightweight owner/holder info
router.get("/", async (req, res) => {
  try {
    const normalizedQuery = normalizeQuery(req.query.q);
    const findQuery = normalizedQuery
      ? { title: { $regex: normalizedQuery, $options: "i" } }
      : {};

    const books = await Book.find(findQuery)
      .populate("owner", "_id username email role")
      .populate("holder", "_id username email role")
      .sort({ createdAt: -1 });

    //get average rating for each book
    const ratings = await Review.aggregate([
      {
        $group: {
          _id: "$book",
          avgRating: { $avg: "$rating" },
          numberOfReviews: { $sum: 1 },
        },
      },
    ]);

    //match rating with books
    const ratingsMap = {};
    ratings.forEach((r) => {
      ratingsMap[r._id.toString()] = {
        avgRating: Math.round(r.avgRating * 10) / 10,
        numberOfReviews: r.numberOfReviews,
      };
    });

    // attach avgRating and numberOfReviews to each book
    const booksWithRatings = books.map((book) => {
      const ratingData = ratingsMap[book._id.toString()] || {
        avgRating: 0,
        numberOfReviews: 0,
      };
      return {
        ...book.toObject(),
        avgRating: ratingData.avgRating,
        numberOfReviews: ratingData.numberOfReviews,
      };
    });

    return res.json(booksWithRatings);
  } catch (_error) {
    return res.status(500).json({ message: "failed to fetch books" });
  }
});

router.patch("/:id", authRequired, async (req, res) => {
  // authRequired is from middleware auth.js, checks for valid token and sets req.user to the token payload
  try {
    const { id } = req.params;
    const { isbn, title, author, genre, description } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "invalid book id" });
    }

    const book = await Book.findById(id);
    // get ID by request sent from frontend, then find the book by id in the database
    // if book doesn't exist, return 404 not found
    if (!book) {
      return res.status(404).json({ message: "book not found" });
    }

    // only owner can edit book details (not holder unless they are the same)
    if (book.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: "forbidden" });
    }

    // update only provided fields
    if (isbn !== undefined) {
      const normalizedIsbn = String(isbn).trim();
      const parsedIsbn = Number(normalizedIsbn);

      // convert to number, remove extra spaces, check if it is a valid number, and not empty after normalization
      if (!normalizedIsbn || Number.isNaN(parsedIsbn)) {
        return res.status(400).json({ message: "valid isbn is required" });
      }

      book.isbn = parsedIsbn;
    }

    if (title !== undefined) book.title = String(title).trim();
    if (author !== undefined) book.author = String(author).trim();
    if (genre !== undefined) book.genre = String(genre).trim();
    if (description !== undefined)
      book.description = String(description).trim();

    await book.save();

    const updatedBook = await Book.findById(book._id)
      .populate("owner", "_id username email role")
      .populate("holder", "_id username email role");
    // populate is used to replace the owner and holder ObjectIds with the actual user documents

    return res.json(updatedBook);
  } catch (error) {
    console.error("update book error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }

    return res.status(500).json({
      message: "failed to update book",
      detail: error.message,
    });
  }
});

// delete book: only owner or admin is allowed
router.delete("/:id", authRequired, async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "invalid book id" });
    }

    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({ message: "book not found" });
    }

    // permission check for who can remove this book
    const isOwner = book.owner.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "forbidden" });
    }

    await Book.findByIdAndDelete(id);
    return res.json({ message: "book deleted" });
  } catch (_error) {
    return res.status(500).json({ message: "failed to delete book" });
  }
});

router.patch("/:id/return", authRequired, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "invalid book id" });
    }

    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({ message: "book not found" });
    }

    const ownerId = book.owner.toString();
    const holderId = book.holder.toString();
    const actorId = req.user.id;

    const requesterCanReturn = actorId === holderId && actorId !== ownerId;
    const ownerCanMarkAvailable = actorId === ownerId && holderId !== ownerId;

    if (!requesterCanReturn && !ownerCanMarkAvailable) {
      return res
        .status(403)
        .json({
          message: "you cannot return this book from the current state",
        });
    }

    book.holder = book.owner;
    await book.save();

    const populatedBook = await Book.findById(book._id)
      .populate("owner", "_id username email role")
      .populate("holder", "_id username email role");

    return res.json(populatedBook);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "failed to return book", detail: error.message });
  }
});

// admin-only toggle: available <-> not_available by switching holder user
router.patch(
  "/:id/toggle-status",
  authRequired,
  requireRole("admin"),
  async (req, res) => {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "invalid book id" });
      }

      const book = await Book.findById(id);
      if (!book) {
        return res.status(404).json({ message: "book not found" });
      }

      const ownerId = book.owner.toString();
      const actingAdminId = req.user.id;

      // admin toggle: if currently available, admin borrows it (but owner cannot borrow own book here)
      if (book.status === "available") {
        if (actingAdminId === ownerId) {
          return res.status(409).json({ success: false });
        }
        book.holder = actingAdminId;
      } else {
        // if currently borrowed, return it by setting holder back to owner
        book.holder = book.owner;
      }

      await book.save();

      // only makes the front end update after toggling. so that the admin can see that the holder changed
      const updatedBook = await Book.findById(book._id)
        .populate("owner", "_id username")
        .populate("holder", "_id username");

      return res.json(updatedBook);
    } catch (_error) {
      return res.status(500).json({ message: "failed to toggle book status" });
    }
  },
);

// export router so server can mount books routes
module.exports = router;
