const mongoose = require("mongoose");

const ALLOWED_STATUS = ["with_owner", "exchanged", "lended"];

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
    trim: true,
  },
  genre: {
    type: String,
    trim: true,
    rquired: true,
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
    trim: true,
  },
});

bookSchema.pre("validate", function (next) {
  if (!this.owner || !this.holder || !this.status) {
    return next();
  }

  const sameUser = this.owner.toString() === this.holder.toString();

  if (sameUser && this.status !== "with_owner") {
    return next(
      new Error("If holder equals owner, status must be 'with_owner'."),
    );
  }

  if (!sameUser && this.status === "with_owner") {
    return next(
      new Error("Status 'with_owner' requires holder to be the owner."),
    );
  }

  return next();
});

module.exports = mongoose.model("Book", bookSchema);
