// load express, mongodb id tools, models, and auth middleware
const express = require("express");
const mongoose = require("mongoose");

const Book = require("../models/Book");
const User = require("../models/User");
const { authRequired, requireRole } = require("../middleware/auth");

// router groups all user-management endpoints
const router = express.Router();

// helper to remove sensitive password before returning user data to client
const sanitizeUser = (userDoc) => {
  const user = userDoc.toObject();
  delete user.password;
  return user;
};

// get all users (newest first)
router.get("/", async (_req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    return res.json(users.map(sanitizeUser));
  } catch (_error) {
    return res.status(500).json({ message: "failed to fetch users" });
  }
});

// update current logged-in user's own profile fields
router.patch("/me", authRequired, async (req, res) => {
  try {
    const { username, description } = req.body;
    // req.user.id comes from decoded jwt in authRequired middleware
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }

    // only update username if caller sent it
    if (typeof username !== "undefined") {
      const trimmedUsername = String(username).trim();
      if (!trimmedUsername) {
        return res.status(400).json({ message: "username is required" });
      }

      user.username = trimmedUsername;
    }

    // only update description if caller sent it
    if (typeof description !== "undefined") {
      user.description = String(description).trim();
    }

    await user.save();
    return res.json(sanitizeUser(user));
  } catch (error) {
    // username unique constraint conflict
    if (error.code === 11000) {
      return res.status(409).json({ message: "username already exists" });
    }

    // mongoose validation errors
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }

    return res.status(500).json({ message: "failed to update profile" });
  }
});

// admin-only: switch a user's role between admin and user
router.patch(
  "/:id/cycle-role",
  authRequired,
  requireRole("admin"),
  async (req, res) => {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "invalid user id" });
      }

      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ message: "user not found" });
      }

      // flip role value each time endpoint is called
      user.role = user.role === "admin" ? "user" : "admin";
      await user.save();

      return res.json(sanitizeUser(user));
    } catch (_error) {
      return res.status(500).json({ message: "failed to cycle role" });
    }
  },
);

// admin-only: suspend or reactivate a user account
router.patch(
  "/:id/toggle-status",
  authRequired,
  requireRole("admin"),
  async (req, res) => {
    try {
      const { id } = req.params;
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "invalid user id" });
      }

      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({ message: "user not found" });
      }

      // flip status value each time endpoint is called
      user.status = user.status === "active" ? "suspended" : "active";
      await user.save();

      return res.json(sanitizeUser(user));
    } catch (_error) {
      return res.status(500).json({ message: "failed to toggle status" });
    }
  },
);

// admin-only: delete user if not self and if user has no linked books
router.delete("/:id", authRequired, requireRole("admin"), async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "invalid user id" });
    }

    if (id === req.user.id) {
      return res
        .status(400)
        .json({ message: "admin cannot delete own account" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }

    // prevent deletion if user still owns/holds book records
    const linkedBooks = await Book.countDocuments({
      $or: [{ owner: id }, { holder: id }],
    });

    if (linkedBooks > 0) {
      return res.status(409).json({
        message: "cannot delete user with linked books",
      });
    }

    await User.findByIdAndDelete(id);
    return res.json({ message: "user deleted" });
  } catch (_error) {
    return res.status(500).json({ message: "failed to delete user" });
  }
});

// export router so server can mount users routes
module.exports = router;
