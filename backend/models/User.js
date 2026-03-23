// load mongoose for schema/model and bcrypt for password hashing
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// allowed values to keep role and account status consistent
const ALLOWED_ROLES = ["admin", "user"];
const ALLOWED_STATUS = ["active", "suspended"];

// schema that defines user fields and validation rules
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

// runs whenever a user document is saved and password was changed aka register or future changepassword
userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  // create salt then hash password so plain text password is never stored in db
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// helper method to compare login password with stored hashed password
userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// export User model so controllers/routes can use it
module.exports = mongoose.model("User", userSchema);
