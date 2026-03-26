// load express and auth-related dependencies used by this route file
const express = require("express");

const User = require("../models/User");
const { authRequired, signToken } = require("../middleware/auth");

// router groups auth endpoints like register, login, and current-user check
const router = express.Router();

// helper to remove sensitive fields before sending user data to client
const toPublicUser = (userDoc) => {
  const user = userDoc.toObject();
  delete user.password;
  return user;
};

// register endpoint: validates input, creates user, then returns token + safe user data
router.post("/register", async (req, res) => {
  try {
    // read values sent by client in request body
    const { username, email, password } = req.body;

    // quick required-field check before trying to create user
    if (!username || !email || !password) {
      return res.status(400).json({
        message: "username, email, password are required",
      });
    }

    // create user in database (password hashing is handled in User model pre-save hook)
    const createdUser = await User.create({
      username,
      email,
      password,
      role: "user",
    });

    // sign jwt token so user can stay logged in on next requests
    const token = signToken(createdUser);

    return res.status(201).json({
      message: "registered",
      token,
      user: toPublicUser(createdUser),
    });
  } catch (error) {
    console.error("register error:", error);
    // duplicate key code from mongodb when username/email already exists
    if (error.code === 11000) {
      return res
        .status(409)
        .json({ message: "username or email already exists" });
    }

    // mongoose schema validation errors (invalid/missing values)
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }

    return res.status(500).json({
      message: "failed to register",
      detail: error.message,
    });
  }
});

// login endpoint: finds user, checks password/status, then returns token + safe user data
router.post("/login", async (req, res) => {
  try {
    // allow login using identifier or email or username from body
    const { email, username, password } = req.body;
    // normalize input so lookup is consistent with lowercase usernames
    const loginId = (email || username || "").trim().toLowerCase();

    // must have id + password to continue
    if (!loginId || !password) {
      return res.status(400).json({
        message: "identifier (email or username) and password are required",
      });
    }

    // get user by username or email and get password for compare step
    const user = await User.findOne({
      $or: [{ username: loginId }, { email: loginId }],
    }).select("+password");
    // avoid leaking whether username exists by using generic credentials error
    if (!user) {
      return res.status(401).json({ message: "invalid credentials" });
    }

    // suspended users are found but blocked from logging in
    if (user.status === "suspended") {
      return res.status(403).json({ message: "account is suspended" });
    }

    // compare raw password from request with stored hash in database
    const matched = await user.comparePassword(password);
    if (!matched) {
      return res.status(401).json({ message: "invalid credentials" });
    }

    // create token only after credential checks pass
    const token = signToken(user);

    return res.json({
      message: "logged in",
      token,
      user: toPublicUser(user),
    });
  } catch (error) {
    console.error("login error:", error);
    // fallback for unexpected server errors
    return res.status(500).json({
      message: "failed to login",
      detail: error.message,
    });
  }
});

// me endpoint: returns currently logged in user using token identity from auth middleware
router.get("/me", authRequired, async (req, res) => {
  try {
    // req.user.id comes from decoded jwt payload in authRequired middleware
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }

    return res.json(toPublicUser(user));
  } catch (_error) {
    return res.status(500).json({ message: "failed to fetch current user" });
  }
});

// export router so server can mount these auth routes
module.exports = router;
