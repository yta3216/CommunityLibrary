const router = require('express').Router();
const { authRequired } = require('../middleware/auth');
const authController = require('../controllers/authController');

// Register and login
router.post('/register', authController.register);
router.post('/login', authController.login);

// Get auth'd user info
router.get('/me', authRequired, authController.getMe);

module.exports = router;