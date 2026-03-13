const mongoose = require("mongoose");

const ALLOWED_STATUS = ["with_owner", "exchanged", "lended"];

const bookSchema = new mongoose.Schema(
  {
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
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    holder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    status: {
      type: String,
      required: false,
      enum: ALLOWED_STATUS,
    },
    description: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true },
);

bookSchema.pre("validate", function () {
  if (!this.owner || !this.holder || !this.status) {
    return;
  }

  const sameUser = this.owner.toString() === this.holder.toString();

  if (sameUser && this.status !== "with_owner") {
    throw new Error("If holder equals owner, status must be 'with_owner'.");
  }

  if (!sameUser && this.status === "with_owner") {
    throw new Error("Status 'with_owner' requires holder to be the owner.");
  }
});

module.exports = mongoose.model("Book", bookSchema);
