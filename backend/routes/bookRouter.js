const router = require('express').Router();
const { authRequired, requireRole } = require('../middleware/auth');
const bookController = require('../controllers/bookController');

// Create book
router.post('/', authRequired, bookController.createBook);

// All books
router.get('/', bookController.listBooks);

// Popular books
router.get('/popular', bookController.getPopularBooks);

// Book by specific id
router.get('/:id', authRequired, bookController.getBook);
router.patch('/:id', authRequired, bookController.updateBook);
router.delete('/:id', authRequired, bookController.deleteBook);

// Owner sets their book availability
router.patch('/:id/availability', authRequired, bookController.setAvailability);

// Admin actions
router.patch('/:id/return', authRequired, bookController.returnBook);
router.patch('/:id/toggle-status', authRequired, requireRole('admin'), bookController.toggleBookStatus);

module.exports = router;