const favoritesService = require('./favoritesService');

class FavoritesController {
  /**
   * Adicionar local aos favoritos
   */
  async addFavorite(req, res) {
    try {
      const { uid } = req.user;
      const favoriteData = req.body;

      const favorite = await favoritesService.addFavorite(uid, favoriteData);
      
      res.status(201).json({
        success: true,
        data: favorite
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Buscar todos os favoritos do usuário
   */
  async getUserFavorites(req, res) {
    try {
      const { uid } = req.user;
      
      const favorites = await favoritesService.getUserFavorites(uid);
      
      res.status(200).json({
        success: true,
        data: favorites
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Buscar favorito específico
   */
  async getFavorite(req, res) {
    try {
      const { uid } = req.user;
      const { favoriteId } = req.params;
      
      const favorite = await favoritesService.getFavorite(uid, favoriteId);
      
      res.status(200).json({
        success: true,
        data: favorite
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Verificar se um local está nos favoritos
   */
  async isFavorite(req, res) {
    try {
      const { uid } = req.user;
      const { placeId } = req.params;
      
      const isFav = await favoritesService.isFavorite(uid, placeId);
      
      res.status(200).json({
        success: true,
        data: { isFavorite: isFav }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Atualizar favorito
   */
  async updateFavorite(req, res) {
    try {
      const { uid } = req.user;
      const { favoriteId } = req.params;
      const updateData = req.body;
      
      const favorite = await favoritesService.updateFavorite(uid, favoriteId, updateData);
      
      res.status(200).json({
        success: true,
        data: favorite
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Remover favorito
   */
  async removeFavorite(req, res) {
    try {
      const { uid } = req.user;
      const { favoriteId } = req.params;
      
      const result = await favoritesService.removeFavorite(uid, favoriteId);
      
      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Remover favorito por placeId
   */
  async removeFavoriteByPlaceId(req, res) {
    try {
      const { uid } = req.user;
      const { placeId } = req.params;
      
      const result = await favoritesService.removeFavoriteByPlaceId(uid, placeId);
      
      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Buscar favoritos por localização
   */
  async getFavoritesByLocation(req, res) {
    try {
      const { uid } = req.user;
      const { lat, lng } = req.query;
      
      if (!lat || !lng) {
        return res.status(400).json({
          success: false,
          message: 'Latitude e longitude são obrigatórios'
        });
      }

      const location = { lat: parseFloat(lat), lng: parseFloat(lng) };
      const favorites = await favoritesService.getFavoritesByLocation(uid, location);
      
      res.status(200).json({
        success: true,
        data: favorites
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Buscar estatísticas dos favoritos
   */
  async getFavoritesStats(req, res) {
    try {
      const { uid } = req.user;
      
      const stats = await favoritesService.getFavoritesStats(uid);
      
      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new FavoritesController(); 