const express = require("express");
const mongoose = require("mongoose");

const Book = require("../models/Book");
const User = require("../models/User");
const { authRequired, requireRole } = require("../middleware/auth");

const router = express.Router();

router.post("/", authRequired, async (req, res) => {
  try {
    const { isbn, title, author, genre, description } = req.body;

    const normalizedIsbn = String(isbn || "").trim();
    const normalizedTitle = String(title || "").trim();
    const normalizedAuthor = String(author || "").trim();
    const normalizedGenre = String(genre || "").trim();
    const normalizedDescription = String(description || "").trim();

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

    if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
      return res.status(401).json({ message: "invalid authenticated user" });
    }

    const ownerUser = await User.findById(req.user.id);
    if (!ownerUser) {
      return res.status(404).json({ message: "authenticated user not found" });
    }

    const ownerId = ownerUser._id;

    const createdBook = await Book.create({
      isbn: normalizedIsbn,
      title: normalizedTitle,
      author: normalizedAuthor,
      genre: normalizedGenre,
      owner: ownerId,
      holder: ownerId,
      description: normalizedDescription,
    });

    const populatedBook = await Book.findById(createdBook._id)
      .populate("owner", "_id username name email role status description")
      .populate("holder", "_id username name email role status description");

    return res.status(201).json(populatedBook);
  } catch (error) {
    console.error("create book error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }

    return res.status(500).json({
      message: "failed to create book",
      detail: error.message,
    });
  }
});

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

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "invalid book id" });
    }

    const book = await Book.findById(id)
      .populate("owner", "_id username name email role")
      .populate("holder", "_id username name email role");

    if (!book) {
      return res.status(404).json({ message: "book not found" });
    }

    return res.json(book);
  } catch (_error) {
    return res.status(500).json({ message: "failed to fetch book" });
  }
});

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

      if (book.status === "available") {
        const replacementHolder = await User.findOne({
          _id: { $ne: ownerId },
        }).sort({ createdAt: 1 });
        if (!replacementHolder) {
          return res
            .status(409)
            .json({ message: "no alternate user available to hold this book" });
        }
        book.holder = replacementHolder._id;
      } else {
        book.holder = book.owner;
      }

      await book.save();

      const updatedBook = await Book.findById(book._id)
        .populate("owner", "_id username name email role")
        .populate("holder", "_id username name email role");

      return res.json(updatedBook);
    } catch (_error) {
      return res.status(500).json({ message: "failed to toggle book status" });
    }
  },
);

module.exports = router;
