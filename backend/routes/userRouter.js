const router = require('express').Router();
const { authRequired, requireRole } = require('../middleware/auth');
const userController = require('../controllers/userController');

router.get('/', userController.listUsers);

// Update auth'd user
router.patch('/me', authRequired, userController.updateMe);

// Books
router.get('/me/books', authRequired, userController.getMyBooks);

// Admin actions
router.patch('/:id/cycle-role', authRequired, requireRole('admin'), userController.cycleRole);
router.patch('/:id/toggle-status', authRequired, requireRole('admin'), userController.toggleStatus);
router.delete('/:id', authRequired, requireRole('admin'), userController.deleteUser);

module.exports = router;