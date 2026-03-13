const express = require("express");
const mongoose = require("mongoose");

const User = require("../models/User");

const router = express.Router();

const sanitizeUser = (userDoc) => {
	const user = userDoc.toObject();
	delete user.password;
	return user;
};

router.post("/", async (req, res) => {
	try {
		const { username, name, email, password, role } = req.body;

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
		});

		return res.status(201).json(sanitizeUser(createdUser));
	} catch (error) {
		if (error.code === 11000) {
			return res.status(409).json({ message: "username or email already exists" });
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

module.exports = router;
