const express = require("express");
const mongoose = require("mongoose");

const Book = require("../models/Book");
const User = require("../models/User");
const { authRequired, requireRole } = require("../middleware/auth");

const router = express.Router();

const sanitizeUser = (userDoc) => {
  const user = userDoc.toObject();
  delete user.password;
  return user;
};

router.post("/", async (req, res) => {
  try {
    const { username, name, email, password, role, status, description } =
      req.body;

    if (!username || !name || !email || !password) {
      return res.status(400).json({
        message: "username, name, email, password are required",
      });
    }

    const createdUser = await User.create({
      username,
      name,
      email,
      password,
      role,
      status,
      description,
    });

    return res.status(201).json(sanitizeUser(createdUser));
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(409)
        .json({ message: "username or email already exists" });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }

    return res.status(500).json({ message: "failed to create user" });
  }
});

router.get("/", async (_req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    return res.json(users.map(sanitizeUser));
  } catch (_error) {
    return res.status(500).json({ message: "failed to fetch users" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "invalid user id" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }

    return res.json(sanitizeUser(user));
  } catch (_error) {
    return res.status(500).json({ message: "failed to fetch user" });
  }
});

router.patch("/me", authRequired, async (req, res) => {
  try {
    const { username, description } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }

    if (typeof username !== "undefined") {
      const trimmedUsername = String(username).trim();
      if (!trimmedUsername) {
        return res.status(400).json({ message: "username is required" });
      }

      user.username = trimmedUsername;
    }

    if (typeof description !== "undefined") {
      user.description = String(description).trim();
    }

    await user.save();
    return res.json(sanitizeUser(user));
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "username already exists" });
    }

    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }

    return res.status(500).json({ message: "failed to update profile" });
  }
});

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

      user.role = user.role === "admin" ? "user" : "admin";
      await user.save();

      return res.json(sanitizeUser(user));
    } catch (_error) {
      return res.status(500).json({ message: "failed to cycle role" });
    }
  },
);

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

      user.status = user.status === "active" ? "suspended" : "active";
      await user.save();

      return res.json(sanitizeUser(user));
    } catch (_error) {
      return res.status(500).json({ message: "failed to toggle status" });
    }
  },
);

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

module.exports = router;
