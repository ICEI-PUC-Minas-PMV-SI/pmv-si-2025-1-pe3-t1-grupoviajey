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
router.get('/stats', favoritesController.getFavoritesStats);
router.get('/location', favoritesController.getFavoritesByLocation);
router.get('/check/:placeId', favoritesController.isFavorite);
router.get('/:favoriteId', favoritesController.getFavorite);
router.put('/:favoriteId', validate(favoriteSchema), favoritesController.updateFavorite);
router.delete('/:favoriteId', favoritesController.removeFavorite);
router.delete('/place/:placeId', favoritesController.removeFavoriteByPlaceId);

module.exports = router; 