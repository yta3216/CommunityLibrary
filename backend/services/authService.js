const User = require('../models/User');
const { signToken } = require('../middleware/auth');

const sanitizeUser = (userDoc) => {
    const user = userDoc.toObject ? userDoc.toObject() : { ...userDoc };
    delete user.password;
    return user;
};

async function register({ username, email, password }) {
    if (!username || !email || !password) {
        throw new Error('username, email, and password are required', 400);
    }

    const user = await User.create({ username, email, password });
    const token = signToken(user);
    return { user: sanitizeUser(user), token };
}

async function login({ email, username, password }) {
    const identifier = email || username;
    if (!identifier || !password) {
        throw new Error('identifier and password are required', 400);
    }

    const normalized = String(identifier).toLowerCase().trim();

    const user = await User.findOne({ $or: [{ email: normalized }, { username: normalized }] }).select('+password');

    if (!user) throw new Error('invalid credentials', 401);

    if (user.status === 'suspended') {
        throw new Error('your account has been suspended', 403);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) throw new Error('invalid credentials', 401);

    const token = signToken(user);
    return { user: sanitizeUser(user), token };
}

async function getCurrentUser(userId) {
    const user = await User.findById(userId);
    if (!user) throw new Error('user not found', 404);
    return sanitizeUser(user);
}

module.exports = { register, login, getCurrentUser };