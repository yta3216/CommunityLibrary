const router = require('express').Router();
const { authRequired, requireRole } = require('../middleware/auth');
const reviewController = require('../controllers/reviewController');

router.post('/', authRequired, reviewController.createReview);

router.get('/all', authRequired, requireRole('admin'), reviewController.getAllReviews);

router.get('/mine', authRequired, reviewController.getMyReviews);

router.get('/user/:userId', authRequired, requireRole('admin'), reviewController.getReviewsByUser);

router.get('/:bookId', reviewController.getReviews);

router.delete('/:reviewId', authRequired, requireRole('admin'), reviewController.deleteReview);
 
module.exports = router;