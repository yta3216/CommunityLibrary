// load mongoose so we can define schema and create model for mongodb
const mongoose = require("mongoose");

// schema that describes what every chat document should look like
const chatSchema = new mongoose.Schema(
  {
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  { timestamps: true },
);

// create model from schema and export it for use in other files
const Chat = mongoose.model("Chat", chatSchema);
module.exports = Chat;
