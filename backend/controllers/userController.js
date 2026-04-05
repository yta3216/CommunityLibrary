const userService = require('../services/userService');

const listUsers = async (req, res, next) => {
    try {
        res.json(await userService.listUsers());
    } catch (err) { next(err); }
};

// Update auth'd user
const updateMe = async (req, res, next) => {
    try {
        res.json(await userService.updateProfile(req.user.id, req.body));
    } catch (err) { next(err); }
};

// Get all owned and borrowed books for current user
const getMyBooks = async (req, res, next) => {
    try {
        res.json(await userService.getCurrentUserBooks(req.user.id));
    } catch (err) { next(err); }
};

// Admin actions
const cycleRole = async (req, res, next) => {
    try {
        res.json(await userService.cycleRole(req.params.id));
    } catch (err) { next(err); }
};

const toggleStatus = async (req, res, next) => {
    try {
        res.json(await userService.toggleStatus(req.params.id));
    } catch (err) { next(err); }
};

const deleteUser = async (req, res, next) => {
    try {
        await userService.deleteUser(req.params.id, req.user.id);
        res.json({ message: 'user deleted' });
    } catch (err) { next(err); }
};

module.exports = { listUsers, updateMe, getMyBooks, cycleRole, toggleStatus, deleteUser };