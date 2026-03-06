const express = require("express");

const User = require("../models/User");
const { authRequired, signToken } = require("../middleware/auth");

const router = express.Router();

const toPublicUser = (userDoc) => {
	const user = userDoc.toObject();
	delete user.password;
	return user;
};

router.post("/register", async (req, res) => {
	try {
		const { username, name, email, password } = req.body;

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
			role: "user",
		});

		const token = signToken(createdUser);

		return res.status(201).json({
			message: "registered",
			token,
			user: toPublicUser(createdUser),
		});
	} catch (error) {
		console.error("register error:", error);
		if (error.code === 11000) {
			return res.status(409).json({ message: "username or email already exists" });
		}

		if (error.name === "ValidationError") {
			return res.status(400).json({ message: error.message });
		}

		return res.status(500).json({
			message: "failed to register",
			detail: error.message,
		});
	}
});

router.post("/login", async (req, res) => {
	try {
		const { email, password } = req.body;
		if (!email || !password) {
			return res.status(400).json({ message: "email and password are required" });
		}

		const user = await User.findOne({ email }).select("+password");
		if (!user) {
			return res.status(401).json({ message: "invalid credentials" });
		}

		const matched = await user.comparePassword(password);
		if (!matched) {
			return res.status(401).json({ message: "invalid credentials" });
		}

		const token = signToken(user);

		return res.json({
			message: "logged in",
			token,
			user: toPublicUser(user),
		});
	} catch (error) {
		console.error("login error:", error);
		return res.status(500).json({
			message: "failed to login",
			detail: error.message,
		});
	}
});

router.get("/me", authRequired, async (req, res) => {
	try {
		const user = await User.findById(req.user.id);
		if (!user) {
			return res.status(404).json({ message: "user not found" });
		}

		return res.json(toPublicUser(user));
	} catch (_error) {
		return res.status(500).json({ message: "failed to fetch current user" });
	}
});

module.exports = router;
