const express = require('express');
const router = express.Router();
const favoritesController = require('./favoritesController');
const { authenticateUser, requireAnyUser } = require('../../middlewares/auth');
const { validate, favoriteSchema } = require('../../middlewares/validation');

// Todas as rotas requerem autenticação
router.use(authenticateUser);
router.use(requireAnyUser);

// Rotas para favoritos
router.post('/', validate(favoriteSchema), favoritesController.addFavorite);
router.get('/', favoritesController.getUserFavorites);
router.get('/check/:placeId', favoritesController.isFavorite);
router.get('/stats', favoritesController.getFavoritesStats);
router.delete('/:favoriteId', favoritesController.removeFavorite);

module.exports = router; 