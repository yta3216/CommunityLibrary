const mongoose = require("mongoose");

const ALLOWED_STATUS = ["available", "not_available"];

const bookSchema = new mongoose.Schema({
  isbn: {
    type: String,
    required: true,
    trim: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  author: {
    type: String,
    required: true,
    trim: true,
  },
  genre: {
    type: String,
    trim: true,
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  holder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: ALLOWED_STATUS,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
});

bookSchema.pre("validate", function () {
  if (!this.owner || !this.holder) {
    return;
  }

  const sameUser = this.owner.toString() === this.holder.toString();
  this.status = sameUser ? "available" : "not_available";
});

module.exports = mongoose.model("Book", bookSchema);
