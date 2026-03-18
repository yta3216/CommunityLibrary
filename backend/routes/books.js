const express = require("express");
const mongoose = require("mongoose");

const Book = require("../models/Book");
const User = require("../models/User");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const {
      isbn,
      title,
      author,
      genre,
      owner,
      holder,
      status,
      description,
    } = req.body;

    if (!isbn || !title || !genre) {
      return res.status(400).json({
        message: "isbn, title, genre are required",
      });
    }

    const hasAnyLinkingField = owner || holder || status;
    const hasAllLinkingFields = owner && holder && status;

    if (hasAnyLinkingField && !hasAllLinkingFields) {
      return res.status(400).json({
        message: "owner, holder, status must be provided together",
      });
    }

    if (hasAllLinkingFields) {
      if (
        !mongoose.Types.ObjectId.isValid(owner) ||
        !mongoose.Types.ObjectId.isValid(holder)
      ) {
        return res.status(400).json({ message: "invalid owner or holder id" });
      }

      const [ownerUser, holderUser] = await Promise.all([
        User.findById(owner),
        User.findById(holder),
      ]);

      if (!ownerUser || !holderUser) {
        return res.status(404).json({ message: "owner or holder user not found" });
      }
    }

    const createdBook = await Book.create({
      isbn,
      title,
      author,
      genre,
      owner,
      holder,
      status,
      description,
    });

    return res.status(201).json(createdBook);
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

module.exports = router;
