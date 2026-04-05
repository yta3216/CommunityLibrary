const router = require('express').Router();
const { authRequired } = require('../middleware/auth');
const auth_controller = require('../controllers/auth_controller');

// Register and login
router.post('/register', auth_controller.register);
router.post('/login', auth_controller.login);

// Get auth'd user info
router.get('/me', authRequired, auth_controller.getMe);

module.exports = router;