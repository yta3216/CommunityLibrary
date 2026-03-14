const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const ALLOWED_ROLES = ["admin", "user"];
const ALLOWED_STATUS = ["active", "suspended"];

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
    select: false,
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
  status: {
    type: String,
    required: true,
    enum: ALLOWED_STATUS,
    default: "active",
  },
  description: {
    type: String,
    trim: true,
    default: "",
    maxlength: 300,
  },
});

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
