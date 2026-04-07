// load mongoose so we can define schema and create model for mongodb
const mongoose = require("mongoose");

// only these status values are allowed for a book
const ALLOWED_STATUS = ["available", "not_available"];

// schema that describes what every book document should look like
const bookSchema = new mongoose.Schema({
  isbn: {
    type: Number,
    required: true,
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
  ownerLocked: {
    type: Boolean,
    required: true,
    default: false
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
  //increase count based on added review
  numberOfReviews: {
    type: Number,
    required: true,
    default: 0,
  },
  avgReviews: {
    type: Number,
    required: true,
    default: 0,
  },
  },{ timestamps: true });

// before validation, auto-set status based on whether owner and holder are the same user
bookSchema.pre("validate", function () {
  if (!this.owner || !this.holder) return;
  const lentOut = this.owner.toString() !== this.holder.toString();
  this.status = (!lentOut && !this.ownerLocked) ? "available" : "not_available";
});

// export the Book model so routes/controllers can use it
module.exports = mongoose.model("Book", bookSchema);
