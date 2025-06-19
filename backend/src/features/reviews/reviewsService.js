const { db } = require('../../config/firebase');

class ReviewsService {
  /**
   * Criar review para um local
   */
  async createReview(placeId, userId, reviewData) {
    try {
      const reviewsRef = db
        .collection('placeReviews')
        .doc(placeId)
        .collection('userReviews');
      
      const review = {
        userId,
        placeId,
        ...reviewData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await reviewsRef.add(review);
      
      return {
        id: docRef.id,
        ...review
      };
    } catch (error) {
      throw new Error(`Erro ao criar review: ${error.message}`);
    }
  }

  /**
   * Buscar todos os reviews de um local
   */
  async getPlaceReviews(placeId) {
    try {
      const reviewsRef = db
        .collection('placeReviews')
        .doc(placeId)
        .collection('userReviews');
      
      const snapshot = await reviewsRef.orderBy('createdAt', 'desc').get();
      
      const reviews = [];
      snapshot.forEach(doc => {
        reviews.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return reviews;
    } catch (error) {
      throw new Error(`Erro ao buscar reviews do local: ${error.message}`);
    }
  }

  /**
   * Buscar review específico
   */
  async getReview(placeId, reviewId) {
    try {
      const reviewRef = db
        .collection('placeReviews')
        .doc(placeId)
        .collection('userReviews')
        .doc(reviewId);
      
      const doc = await reviewRef.get();
      
      if (!doc.exists) {
        throw new Error('Review não encontrado');
      }
      
      return {
        id: doc.id,
        ...doc.data()
      };
    } catch (error) {
      throw new Error(`Erro ao buscar review: ${error.message}`);
    }
  }

  /**
   * Buscar review de um usuário para um local específico
   */
  async getUserReviewForPlace(userId, placeId) {
    try {
      const reviewsRef = db
        .collection('placeReviews')
        .doc(placeId)
        .collection('userReviews');
      
      const snapshot = await reviewsRef
        .where('userId', '==', userId)
        .get();
      
      if (snapshot.empty) {
        return null;
      }

      const reviewDoc = snapshot.docs[0];
      return {
        id: reviewDoc.id,
        ...reviewDoc.data()
      };
    } catch (error) {
      throw new Error(`Erro ao buscar review do usuário: ${error.message}`);
    }
  }

  /**
   * Buscar todos os reviews de um usuário
   */
  async getUserReviews(userId) {
    try {
      const reviewsRef = db.collection('placeReviews');
      const snapshot = await reviewsRef.get();
      
      const userReviews = [];
      
      for (const placeDoc of snapshot.docs) {
        const placeReviewsRef = placeDoc.ref.collection('userReviews');
        const userReviewsSnapshot = await placeReviewsRef
          .where('userId', '==', userId)
          .orderBy('createdAt', 'desc')
          .get();
        
        userReviewsSnapshot.forEach(reviewDoc => {
          userReviews.push({
            id: reviewDoc.id,
            placeId: placeDoc.id,
            ...reviewDoc.data()
          });
        });
      }
      
      return userReviews;
    } catch (error) {
      throw new Error(`Erro ao buscar reviews do usuário: ${error.message}`);
    }
  }

  /**
   * Atualizar review
   */
  async updateReview(placeId, reviewId, userId, updateData) {
    try {
      const reviewRef = db
        .collection('placeReviews')
        .doc(placeId)
        .collection('userReviews')
        .doc(reviewId);
      
      // Verificar se o review existe e pertence ao usuário
      const doc = await reviewRef.get();
      if (!doc.exists) {
        throw new Error('Review não encontrado');
      }
      
      const review = doc.data();
      if (review.userId !== userId) {
        throw new Error('Acesso negado. Apenas o autor pode editar o review');
      }

      const update = {
        ...updateData,
        updatedAt: new Date()
      };

      await reviewRef.update(update);
      
      return await this.getReview(placeId, reviewId);
    } catch (error) {
      throw new Error(`Erro ao atualizar review: ${error.message}`);
    }
  }

  /**
   * Deletar review
   */
  async deleteReview(placeId, reviewId, userId) {
    try {
      const reviewRef = db
        .collection('placeReviews')
        .doc(placeId)
        .collection('userReviews')
        .doc(reviewId);
      
      // Verificar se o review existe e pertence ao usuário
      const doc = await reviewRef.get();
      if (!doc.exists) {
        throw new Error('Review não encontrado');
      }
      
      const review = doc.data();
      if (review.userId !== userId) {
        throw new Error('Acesso negado. Apenas o autor pode deletar o review');
      }

      await reviewRef.delete();
      
      return { success: true, message: 'Review deletado com sucesso' };
    } catch (error) {
      throw new Error(`Erro ao deletar review: ${error.message}`);
    }
  }

  /**
   * Buscar estatísticas dos reviews de um local
   */
  async getPlaceReviewStats(placeId) {
    try {
      const reviews = await this.getPlaceReviews(placeId);
      
      if (reviews.length === 0) {
        return {
          totalReviews: 0,
          averageRating: 0,
          ratingDistribution: {},
          recentReviews: []
        };
      }

      const totalReviews = reviews.length;
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / totalReviews;

      // Distribuição de ratings
      const ratingDistribution = {};
      for (let i = 1; i <= 5; i++) {
        ratingDistribution[i] = reviews.filter(review => review.rating === i).length;
      }

      // Reviews mais recentes (últimos 5)
      const recentReviews = reviews.slice(0, 5);

      return {
        totalReviews,
        averageRating: Math.round(averageRating * 10) / 10,
        ratingDistribution,
        recentReviews
      };
    } catch (error) {
      throw new Error(`Erro ao buscar estatísticas dos reviews: ${error.message}`);
    }
  }

  /**
   * Verificar se usuário já fez review para um local
   */
  async hasUserReviewed(userId, placeId) {
    try {
      const review = await this.getUserReviewForPlace(userId, placeId);
      return review !== null;
    } catch (error) {
      throw new Error(`Erro ao verificar se usuário já fez review: ${error.message}`);
    }
  }

  /**
   * Buscar reviews por rating
   */
  async getReviewsByRating(placeId, rating) {
    try {
      const reviewsRef = db
        .collection('placeReviews')
        .doc(placeId)
        .collection('userReviews');
      
      const snapshot = await reviewsRef
        .where('rating', '==', rating)
        .orderBy('createdAt', 'desc')
        .get();
      
      const reviews = [];
      snapshot.forEach(doc => {
        reviews.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return reviews;
    } catch (error) {
      throw new Error(`Erro ao buscar reviews por rating: ${error.message}`);
    }
  }
}

module.exports = new ReviewsService(); 