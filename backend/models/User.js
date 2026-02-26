const mongoose = require("mongoose");

const ALLOWED_ROLES = ["admin", "user"];

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    hide: true,
  },
  numberOfBooks: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },
  role: {
    type: String,
    required: true,
    enum: ALLOWED_ROLES,
    default: "user",
  },
});

module.exports = mongoose.model("User", userSchema);
