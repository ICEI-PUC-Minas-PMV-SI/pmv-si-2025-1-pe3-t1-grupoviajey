const { db } = require('../../config/firebase');

class FavoritesService {
  /**
   * Adicionar local aos favoritos
   */
  async addFavorite(userId, favoriteData) {
    try {
      const favoritesRef = db.collection('userFavorites');
      
      const favorite = {
        userId,
        ...favoriteData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await favoritesRef.add(favorite);
      
      return {
        id: docRef.id,
        ...favorite
      };
    } catch (error) {
      throw new Error(`Erro ao adicionar favorito: ${error.message}`);
    }
  }

  /**
   * Buscar todos os favoritos de um usuário
   */
  async getUserFavorites(userId) {
    try {
      const favoritesRef = db.collection('userFavorites');
      const snapshot = await favoritesRef
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get();
      
      const favorites = [];
      snapshot.forEach(doc => {
        favorites.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return favorites;
    } catch (error) {
      throw new Error(`Erro ao buscar favoritos: ${error.message}`);
    }
  }

  /**
   * Buscar favorito específico
   */
  async getFavorite(userId, favoriteId) {
    try {
      const favoriteRef = db.collection('userFavorites').doc(favoriteId);
      const doc = await favoriteRef.get();
      
      if (!doc.exists) {
        throw new Error('Favorito não encontrado');
      }
      
      const favorite = doc.data();
      
      // Verificar se o favorito pertence ao usuário
      if (favorite.userId !== userId) {
        throw new Error('Acesso negado');
      }
      
      return {
        id: doc.id,
        ...favorite
      };
    } catch (error) {
      throw new Error(`Erro ao buscar favorito: ${error.message}`);
    }
  }

  /**
   * Verificar se um local já está nos favoritos
   */
  async isFavorite(userId, placeId) {
    try {
      const favoritesRef = db.collection('userFavorites');
      const snapshot = await favoritesRef
        .where('userId', '==', userId)
        .where('placeId', '==', placeId)
        .get();
      
      return !snapshot.empty;
    } catch (error) {
      throw new Error(`Erro ao verificar favorito: ${error.message}`);
    }
  }

  /**
   * Atualizar favorito
   */
  async updateFavorite(userId, favoriteId, updateData) {
    try {
      const favoriteRef = db.collection('userFavorites').doc(favoriteId);
      
      // Verificar se o favorito existe e pertence ao usuário
      const doc = await favoriteRef.get();
      if (!doc.exists) {
        throw new Error('Favorito não encontrado');
      }
      
      const favorite = doc.data();
      if (favorite.userId !== userId) {
        throw new Error('Acesso negado');
      }

      const update = {
        ...updateData,
        updatedAt: new Date()
      };

      await favoriteRef.update(update);
      
      return await this.getFavorite(userId, favoriteId);
    } catch (error) {
      throw new Error(`Erro ao atualizar favorito: ${error.message}`);
    }
  }

  /**
   * Remover favorito
   */
  async removeFavorite(userId, favoriteId) {
    try {
      const favoriteRef = db.collection('userFavorites').doc(favoriteId);
      
      // Verificar se o favorito existe e pertence ao usuário
      const doc = await favoriteRef.get();
      if (!doc.exists) {
        throw new Error('Favorito não encontrado');
      }
      
      const favorite = doc.data();
      if (favorite.userId !== userId) {
        throw new Error('Acesso negado');
      }

      await favoriteRef.delete();
      
      return { success: true, message: 'Favorito removido com sucesso' };
    } catch (error) {
      throw new Error(`Erro ao remover favorito: ${error.message}`);
    }
  }

  /**
   * Remover favorito por placeId
   */
  async removeFavoriteByPlaceId(userId, placeId) {
    try {
      const favoritesRef = db.collection('userFavorites');
      const snapshot = await favoritesRef
        .where('userId', '==', userId)
        .where('placeId', '==', placeId)
        .get();
      
      if (snapshot.empty) {
        throw new Error('Favorito não encontrado');
      }

      const favoriteDoc = snapshot.docs[0];
      await favoriteDoc.ref.delete();
      
      return { success: true, message: 'Favorito removido com sucesso' };
    } catch (error) {
      throw new Error(`Erro ao remover favorito: ${error.message}`);
    }
  }

  /**
   * Buscar favoritos por localização
   */
  async getFavoritesByLocation(userId, location) {
    try {
      const favorites = await this.getUserFavorites(userId);
      
      // Filtrar por localização aproximada (dentro de um raio)
      const radius = 0.01; // Aproximadamente 1km
      const filteredFavorites = favorites.filter(favorite => {
        if (!favorite.location || !location) return false;
        
        const latDiff = Math.abs(favorite.location.lat - location.lat);
        const lngDiff = Math.abs(favorite.location.lng - location.lng);
        
        return latDiff <= radius && lngDiff <= radius;
      });
      
      return filteredFavorites;
    } catch (error) {
      throw new Error(`Erro ao buscar favoritos por localização: ${error.message}`);
    }
  }

  /**
   * Buscar estatísticas dos favoritos
   */
  async getFavoritesStats(userId) {
    try {
      const favorites = await this.getUserFavorites(userId);
      
      const totalFavorites = favorites.length;
      const uniquePlaces = new Set(favorites.map(fav => fav.placeId)).size;
      
      // Agrupar por tipo de local (se houver)
      const placeTypes = {};
      favorites.forEach(favorite => {
        const type = favorite.type || 'unknown';
        placeTypes[type] = (placeTypes[type] || 0) + 1;
      });
      
      return {
        totalFavorites,
        uniquePlaces,
        placeTypes
      };
    } catch (error) {
      throw new Error(`Erro ao buscar estatísticas dos favoritos: ${error.message}`);
    }
  }
}

module.exports = new FavoritesService(); 