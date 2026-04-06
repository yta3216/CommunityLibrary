// load mongoose for schema/model and bcrypt for password hashing
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// validadtion values to files consistent to what is expected by our code
const ALLOWED_ROLES = ["admin", "user"];
const ALLOWED_STATUS = ["active", "suspended"];
const USERNAME_REGEX = /^[a-zA-Z0-9]+$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// schema that defines user fields and validation rules
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    minlength: 3,
    maxlength: 20,
    match: USERNAME_REGEX,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: EMAIL_REGEX,
  },
  password: {
    type: String,
    required: true,
    select: false,
    minlength: 5, //
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
  profileImageUrl: {
    type: String,
    trim: true,
    default: "",
    maxlength: 5_000_000,
  },

}, { timestamps: true });

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
