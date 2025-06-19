const reviewsService = require('./reviewsService');

class ReviewsController {
  /**
   * Criar review para um local
   */
  async createReview(req, res) {
    try {
      const { uid } = req.user;
      const { placeId } = req.params;
      const reviewData = req.body;

      // Verificar se o usuário já fez review para este local
      const existingReview = await reviewsService.getUserReviewForPlace(uid, placeId);
      if (existingReview) {
        return res.status(400).json({
          success: false,
          message: 'Você já fez um review para este local'
        });
      }

      const review = await reviewsService.createReview(placeId, uid, reviewData);
      
      res.status(201).json({
        success: true,
        data: review
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Buscar todos os reviews de um local
   */
  async getPlaceReviews(req, res) {
    try {
      const { placeId } = req.params;
      
      const reviews = await reviewsService.getPlaceReviews(placeId);
      
      res.status(200).json({
        success: true,
        data: reviews
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Buscar review específico
   */
  async getReview(req, res) {
    try {
      const { placeId, reviewId } = req.params;
      
      const review = await reviewsService.getReview(placeId, reviewId);
      
      res.status(200).json({
        success: true,
        data: review
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Buscar review do usuário para um local específico
   */
  async getUserReviewForPlace(req, res) {
    try {
      const { uid } = req.user;
      const { placeId } = req.params;
      
      const review = await reviewsService.getUserReviewForPlace(uid, placeId);
      
      res.status(200).json({
        success: true,
        data: review
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Buscar todos os reviews do usuário
   */
  async getUserReviews(req, res) {
    try {
      const { uid } = req.user;
      
      const reviews = await reviewsService.getUserReviews(uid);
      
      res.status(200).json({
        success: true,
        data: reviews
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Atualizar review
   */
  async updateReview(req, res) {
    try {
      const { uid } = req.user;
      const { placeId, reviewId } = req.params;
      const updateData = req.body;
      
      const review = await reviewsService.updateReview(placeId, reviewId, uid, updateData);
      
      res.status(200).json({
        success: true,
        data: review
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Deletar review
   */
  async deleteReview(req, res) {
    try {
      const { uid } = req.user;
      const { placeId, reviewId } = req.params;
      
      const result = await reviewsService.deleteReview(placeId, reviewId, uid);
      
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
   * Buscar estatísticas dos reviews de um local
   */
  async getPlaceReviewStats(req, res) {
    try {
      const { placeId } = req.params;
      
      const stats = await reviewsService.getPlaceReviewStats(placeId);
      
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

  /**
   * Verificar se usuário já fez review para um local
   */
  async hasUserReviewed(req, res) {
    try {
      const { uid } = req.user;
      const { placeId } = req.params;
      
      const hasReviewed = await reviewsService.hasUserReviewed(uid, placeId);
      
      res.status(200).json({
        success: true,
        data: { hasReviewed }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Buscar reviews por rating
   */
  async getReviewsByRating(req, res) {
    try {
      const { placeId } = req.params;
      const { rating } = req.query;
      
      if (!rating || rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: 'Rating deve ser um número entre 1 e 5'
        });
      }

      const reviews = await reviewsService.getReviewsByRating(placeId, parseInt(rating));
      
      res.status(200).json({
        success: true,
        data: reviews
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new ReviewsController(); 