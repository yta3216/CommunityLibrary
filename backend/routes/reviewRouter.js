const router = require('express').Router();
const { authRequired } = require('../middleware/auth');
const reviewController = require('../controllers/reviewController');

router.post('/', authRequired, reviewController.createReview);

router.get('/:bookId', reviewController.getReviews);

module.exports = router;