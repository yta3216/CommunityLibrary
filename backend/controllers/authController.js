const authService = require('../services/authService');

const register = async (req, res, next) => {
    try {
        res.status(201).json(await authService.register(req.body));
    } catch (err) { next(err); }
};

const login = async (req, res, next) => {
    try {
        res.json(await authService.login(req.body));
    } catch (err) { next(err); }
};

const getMe = async (req, res, next) => {
    try {
        res.json(await authService.getCurrentUser(req.user.id));
    } catch (err) { next(err); }
};

module.exports = { register, login, getMe };