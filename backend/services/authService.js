const User = require('../models/User');
const { signToken } = require('../middleware/auth');

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

const sanitizeUser = (userDoc) => {
    const user = userDoc.toObject ? userDoc.toObject() : { ...userDoc };
    delete user.password;
    return user;
};

async function register({ username, email, password, profileImageUrl }) {
    if (!username || !email || !password || !profileImageUrl) {
        throw createError('username, email, password, and profileImageUrl are required', 400);
    }

    if (!isValidImageUrl(profileImageUrl)) {
        throw createError('profileImageUrl must be a valid image URL or data URL', 400);
    }

    const user = await User.create({
        username,
        email,
        password,
        profileImageUrl: profileImageUrl.trim(),
    });
    const token = signToken(user);
    return { user: sanitizeUser(user), token };
}

async function login({ email, username, password }) {
    const identifier = email || username;
    if (!identifier || !password) {
        throw createError('identifier and password are required', 400);
    }

    const normalized = String(identifier).toLowerCase().trim();

    const user = await User.findOne({ $or: [{ email: normalized }, { username: normalized }] }).select('+password');

    if (!user) throw createError('invalid credentials', 401);

    if (user.status === 'suspended') {
        throw createError('your account has been suspended', 403);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) throw createError('invalid credentials', 401);

    const token = signToken(user);
    return { user: sanitizeUser(user), token };
}

async function getCurrentUser(userId) {
    const user = await User.findById(userId);
    if (!user) throw createError('user not found', 404);
    return sanitizeUser(user);
}

module.exports = { register, login, getCurrentUser };