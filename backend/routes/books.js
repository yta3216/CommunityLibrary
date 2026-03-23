// load express router, mongodb id checks, models, and auth middleware
const express = require("express");
const mongoose = require("mongoose");

const Book = require("../models/Book");
const User = require("../models/User");
const { authRequired, requireRole } = require("../middleware/auth");

// router groups all book-related endpoints
const router = express.Router();

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

    // repull with populated user references so frontend gets full owner/holder info
    const populatedBook = await Book.findById(createdBook._id)
      .populate("owner", "_id username name email role status description")
      .populate("holder", "_id username name email role status description");

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

// list all books with lightweight owner/holder info
router.get("/", async (_req, res) => {
  try {
    const books = await Book.find()
      .populate("owner", "_id username name email role")
      .populate("holder", "_id username name email role")
      .sort({ createdAt: -1 });

    return res.json(books);
  } catch (_error) {
    return res.status(500).json({ message: "failed to fetch books" });
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

      // if currently available, admin borrows it (but owner cannot borrow own book here)
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

      // return updated book with populated references for frontend display
      const updatedBook = await Book.findById(book._id)
        .populate("owner", "_id username name email role")
        .populate("holder", "_id username name email role");

      return res.json(updatedBook);
    } catch (_error) {
      return res.status(500).json({ message: "failed to toggle book status" });
    }
  },
);

// export router so server can mount books routes
module.exports = router;
