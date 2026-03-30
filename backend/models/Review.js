// load mongoose so we can define schema and create model for mongodb
const mongoose = require("mongoose");

// schema that describes what every review document should look like
const reviewSchema = new mongoose.Schema(
  {
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  { timestamps: true },
);

// create model from schema and export it for use in other files
const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;
