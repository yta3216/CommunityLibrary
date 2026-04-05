const router = require('express').Router();
const { authRequired } = require('../middleware/auth');
const review_controller = require('../controllers/review_controller');

router.post('/', authRequired, review_controller.createReview);

router.get('/:bookId', review_controller.getReviews);

module.exports = router;