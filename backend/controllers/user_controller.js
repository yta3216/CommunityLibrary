const user_service = require('../services/user_service');

const listUsers = async (req, res, next) => {
    try {
        res.json(await user_service.listUsers());
    } catch (err) { next(err); }
};

const updateMe = async (req, res, next) => {
    try {
        res.json(await user_service.updateProfile(req.user.id, req.body));
    } catch (err) { next(err); }
};

const getMyBooks = async (req, res, next) => {
    try {
        res.json(await user_service.getCurrentUserBooks(req.user.id));
    } catch (err) { next(err); }
};

const cycleRole = async (req, res, next) => {
    try {
        res.json(await user_service.cycleRole(req.params.id));
    } catch (err) { next(err); }
};

const toggleStatus = async (req, res, next) => {
    try {
        res.json(await user_service.toggleStatus(req.params.id));
    } catch (err) { next(err); }
};

const deleteUser = async (req, res, next) => {
    try {
        await user_service.deleteUser(req.params.id, req.user.id);
        res.json({ message: 'user deleted' });
    } catch (err) { next(err); }
};

module.exports = { listUsers, updateMe, getMyBooks, cycleRole, toggleStatus, deleteUser };