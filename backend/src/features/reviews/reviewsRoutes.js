const express = require('express');
const router = express.Router();
const reviewsController = require('./reviewsController');
const { authenticateUser, requireAnyUser } = require('../../middlewares/auth');
const { validate, reviewSchema } = require('../../middlewares/validation');

// Rotas públicas (não requerem autenticação)
router.get('/places/:placeId', reviewsController.getPlaceReviews);
router.get('/places/:placeId/stats', reviewsController.getPlaceReviewStats);
router.get('/places/:placeId/rating', reviewsController.getReviewsByRating);
router.get('/places/:placeId/reviews/:reviewId', reviewsController.getReview);

// Rotas que requerem autenticação
router.use(authenticateUser);
router.use(requireAnyUser);

// Rotas para usuários autenticados
router.post('/places/:placeId', validate(reviewSchema), reviewsController.createReview);
router.get('/user/places/:placeId', reviewsController.getUserReviewForPlace);
router.get('/user', reviewsController.getUserReviews);
router.get('/user/places/:placeId/check', reviewsController.hasUserReviewed);
router.put('/places/:placeId/reviews/:reviewId', validate(reviewSchema), reviewsController.updateReview);
router.delete('/places/:placeId/reviews/:reviewId', reviewsController.deleteReview);

module.exports = router; 