const router = require('express').Router();
const { authRequired, requireRole } = require('../middleware/auth');
const book_controller = require('../controllers/book_controller');

// Create book
router.post('/', authRequired, book_controller.createBook);

// All books
router.get('/', book_controller.listBooks);

// Book by specific id
router.get('/:id', authRequired, book_controller.getBook);
router.patch('/:id', authRequired, book_controller.updateBook);
router.delete('/:id', authRequired, book_controller.deleteBook);
    
// Popular books
router.get('/popular', book_controller.getPopularBooks);

// Admin actions
router.patch('/:id/return', authRequired, book_controller.returnBook);
router.patch('/:id/toggle-status', authRequired, requireRole('admin'), book_controller.toggleBookStatus);

module.exports = router;