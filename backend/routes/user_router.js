const router = require('express').Router();
const { authRequired, requireRole } = require('../middleware/auth');
const user_controller = require('../controllers/user_controller');

router.get('/', user_controller.listUsers);

// Update auth'd user
router.patch('/me', authRequired, user_controller.updateMe);

// Books
router.get('/me/books', authRequired, user_controller.getMyBooks);

// Admin actions
router.patch('/:id/cycle-role', authRequired, requireRole('admin'), user_controller.cycleRole);
router.patch('/:id/toggle-status', authRequired, requireRole('admin'), user_controller.toggleStatus);
router.delete('/:id', authRequired, requireRole('admin'), user_controller.deleteUser);

module.exports = router;