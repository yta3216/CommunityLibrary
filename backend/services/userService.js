const mongoose = require('mongoose');
const User = require('../models/User');
const Book = require('../models/Book');
const Review = require('../models/Review');

const sanitizeUser = (userDoc) => {
    const user = userDoc.toObject ? userDoc.toObject() : { ...userDoc };
    delete user.password;
    return user;
};

const createError = (message, status) => {
    const error = new Error(message);
    error.status = status;
    return error;
};

const isValidImageUrl = (value) => {
    if (typeof value !== 'string') {
        return false;
    }

    const trimmedValue = value.trim();
    if (!trimmedValue) {
        return false;
    }

    try {
        if (trimmedValue.startsWith('data:image/')) {
            return true;
        }

        const parsedUrl = new URL(trimmedValue);
        return ['http:', 'https:'].includes(parsedUrl.protocol);
    } catch (_error) {
        return false;
    }
};

async function listUsers() {
    const [users, ownedCounts, borrowedCounts, reviewCounts] = await Promise.all([
        User.find().sort({ createdAt: -1 }),
        Book.aggregate([
            { $group: { _id: '$owner', count: { $sum: 1 } } },
        ]),
        Book.aggregate([
            { $match: { $expr: { $ne: ['$owner', '$holder'] } } },
            { $group: { _id: '$holder', count: { $sum: 1 } } },
        ]),
        Review.aggregate([
            { $group: { _id: '$reviewer', count: { $sum: 1 } } },
        ]),
    ]);

    const ownedMap = Object.fromEntries(
        ownedCounts.map((c) => [c._id.toString(), c.count])
    );
    const borrowedMap = Object.fromEntries(
        borrowedCounts.map((c) => [c._id.toString(), c.count])
    );
    const reviewMap = Object.fromEntries(
        reviewCounts.map((c) => [c._id.toString(), c.count])
    );

    return users.map((u) => ({
        ...sanitizeUser(u),
        bookCount: ownedMap[u._id.toString()] || 0,
        borrowedCount: borrowedMap[u._id.toString()] || 0,
        reviewCount: reviewMap[u._id.toString()] || 0,
    }));
}

async function updateProfile(userId, { username, description, profileImageUrl }) {
    const user = await User.findById(userId);
    if (!user) throw createError('user not found', 404);

    if (typeof username !== 'undefined') {
        const trimmed = String(username).trim();
        if (!trimmed) throw createError('username is required', 400);
        user.username = trimmed;
    }

    if (typeof description !== 'undefined') {
        user.description = String(description).trim();
    }

    if (typeof profileImageUrl !== 'undefined') {
        if (!isValidImageUrl(profileImageUrl)) {
            throw createError('profileImageUrl must be a valid image URL or data URL', 400);
        }

        user.profileImageUrl = String(profileImageUrl).trim();
    }

    await user.save();
    return sanitizeUser(user);
}

async function getCurrentUserBooks(userId) {
    const [owned, borrowed] = await Promise.all([
        Book.find({ owner: userId })
            .populate('owner', '_id username')
            .populate('holder', '_id username'),
        Book.find({ holder: userId, owner: { $ne: userId } })
            .populate('owner', '_id username')
            .populate('holder', '_id username'),
    ]);
    return { owned, borrowed };
}

async function cycleRole(targetId) {
    if (!mongoose.Types.ObjectId.isValid(targetId)) {
        throw new Error('invalid user id', 400);
    }
    const user = await User.findById(targetId);
    if (!user) throw new Error('user not found', 404);

    user.role = user.role === 'admin' ? 'user' : 'admin';
    await user.save();
    return sanitizeUser(user);
}

async function toggleStatus(targetId) {
    if (!mongoose.Types.ObjectId.isValid(targetId)) {
        throw new Error('invalid user id', 400);
    }
    const user = await User.findById(targetId);
    if (!user) throw new Error('user not found', 404);

    user.status = user.status === 'active' ? 'suspended' : 'active';
    await user.save();
    return sanitizeUser(user);
}

async function deleteUser(targetId, actorId) {
    if (!mongoose.Types.ObjectId.isValid(targetId)) {
        throw new Error('invalid user id', 400);
    }
    if (targetId === actorId) {
        throw new Error('admin cannot delete own account', 400);
    }

    const user = await User.findById(targetId);
    if (!user) throw new Error('user not found', 404);

    // Delete all books owned by this user before deleting the user
    await Book.deleteMany({ owner: targetId });

    await User.findByIdAndDelete(targetId);
}

module.exports = {
    listUsers,
    updateProfile,
    getCurrentUserBooks,
    cycleRole,
    toggleStatus,
    deleteUser,
};