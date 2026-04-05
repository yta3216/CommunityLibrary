const auth_service = require('../services/auth_service');

const register = async (req, res, next) => {
    try {
        res.status(201).json(await auth_service.register(req.body));
    } catch (err) { next(err); }
};

const login = async (req, res, next) => {
    try {
        res.json(await auth_service.login(req.body));
    } catch (err) { next(err); }
};

const getMe = async (req, res, next) => {
    try {
        res.json(await auth_service.getCurrentUser(req.user.id));
    } catch (err) { next(err); }
};

module.exports = { register, login, getMe };