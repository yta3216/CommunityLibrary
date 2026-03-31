// load mongoose so we can define schema and create model for mongodb
const mongoose = require("mongoose");

// schema that describes what every chat document should look like
const chatMessageSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
  },
  { timestamps: true },
);
const chatSchema = new mongoose.Schema(
  {
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    messages: {
      type: [chatMessageSchema],
      default: [],
    },
  },
  { timestamps: true },
);

chatSchema.index({ book: 1, owner: 1, requester: 1 }, { unique: true });

// create model from schema and export it for use in other files
const Chat = mongoose.model("Chat", chatSchema);
module.exports = Chat;
