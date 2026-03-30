const express = require("express");
const mongoose = require("mongoose");
const Review = require("../models/Review");
const Book = require("../models/Book");
const { authRequired } = require("../middleware/auth");

const router = express.Router();

// POST /api/reviews — logged in user submits a review + rating for a book
router.post("/", authRequired, async (req, res) => {
  try {
    const { bookId, rating, comment } = req.body;

    // make sure bookId was provided and is a valid MongoDB id
    if (!bookId || !mongoose.Types.ObjectId.isValid(bookId)) {
      return res.status(400).json({ message: "valid bookId is required" });
    }

    // rating must be a number 1-5
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "rating must be between 1 and 5" });
    }

    // check the book actually exists
    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: "book not found" });
    }

    // one review per user per book — check if they already reviewed it
    const existing = await Review.findOne({
      book: bookId,
      reviewer: req.user.id,
    });
    if (existing) {
      return res.status(409).json({ message: "you already reviewed this book" });
    }

    // create the review
    const review = await Review.create({
      book: bookId,
      reviewer: req.user.id,
      rating,
      comment: comment || "",
    });

    // increment the book's review count
    await Book.findByIdAndUpdate(bookId, { $inc: { numberOfReviews: 1 } });

    // return review with reviewer info populated
    const populated = await Review.findById(review._id)
      .populate("reviewer", "username");

    return res.status(201).json(populated);
  } catch (error) {
    console.error("create review error:", error);
    return res.status(500).json({ message: "failed to create review" });
  }
});

// GET /api/reviews/:bookId — get all reviews for a specific book (no login needed)
router.get("/:bookId", async (req, res) => {
  try {
    const { bookId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(bookId)) {
      return res.status(400).json({ message: "invalid book id" });
    }

    const reviews = await Review.find({ book: bookId })
      .populate("reviewer", "username")
      .sort({ createdAt: -1 });

    // calculate the average rating for this book
    const avgResult = await Review.aggregate([
      { $match: { book: new mongoose.Types.ObjectId(bookId) } },
      { $group: { _id: "$book", avgRating: { $avg: "$rating" } } },
    ]);

    const avgRating = avgResult.length > 0
      ? Math.round(avgResult[0].avgRating * 10) / 10
      : 0;

    return res.json({ reviews, avgRating });
  } catch (error) {
    console.error("get reviews error:", error);
    return res.status(500).json({ message: "failed to fetch reviews" });
  }
});

module.exports = router;