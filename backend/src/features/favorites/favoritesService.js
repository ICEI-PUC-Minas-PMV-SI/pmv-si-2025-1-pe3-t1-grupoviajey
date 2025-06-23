const { db } = require('../../config/firebase');

class FavoritesService {
  /**
   * Returns a reference to the user's favorites subcollection.
   * This is the single source of truth for the database path.
   * @param {string} userId - The ID of the user.
   * @returns {FirebaseFirestore.CollectionReference}
   */
  _getFavoritesCollection(userId) {
    if (!userId) {
      throw new Error('User ID is required to get favorites collection.');
    }
    return db.collection('users').doc(userId).collection('userFavorites');
  }

  /**
   * Add a place to favorites, ensuring no duplicates.
   */
  async addFavorite(userId, favoriteData) {
    const { placeId } = favoriteData;
    const favoritesRef = this._getFavoritesCollection(userId);
    const q = favoritesRef.where('placeId', '==', placeId);
    const existing = await q.get();

    if (!existing.empty) {
      console.log(`[FavService] Favorite with placeId ${placeId} already exists.`);
      const doc = existing.docs[0];
      return { id: doc.id, ...doc.data() };
    }

    const favorite = { ...favoriteData, createdAt: new Date() };
    const docRef = await favoritesRef.add(favorite);
    console.log(`[FavService] Saved new favorite to users/${userId}/userFavorites/${docRef.id}`);
    return { id: docRef.id, ...favorite };
  }

  /**
   * Get all favorites for a user.
   */
  async getUserFavorites(userId) {
    const favoritesRef = this._getFavoritesCollection(userId);
    const snapshot = await favoritesRef.orderBy('createdAt', 'desc').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  /**
   * Check if a specific place is favorited by the user.
   */
  async isFavorite(userId, placeId) {
    const favoritesRef = this._getFavoritesCollection(userId);
    const q = favoritesRef.where('placeId', '==', placeId);
    const snapshot = await q.get();
    return !snapshot.empty;
  }

  /**
   * Remove a favorite using its unique document ID.
   */
  async removeFavorite(userId, favoriteId) {
    const favoritesRef = this._getFavoritesCollection(userId);
    await favoritesRef.doc(favoriteId).delete();
    return { success: true, message: 'Favorito removido com sucesso' };
  }

  /**
   * Remove all favorite entries for a given placeId.
   */
  async removeFavoriteByPlaceId(userId, placeId) {
    const favoritesRef = this._getFavoritesCollection(userId);
    const q = favoritesRef.where('placeId', '==', placeId);
    const snapshot = await q.get();

    if (snapshot.empty) {
      return { success: true, message: 'Nenhum favorito encontrado para remoção.' };
    }

    const batch = db.batch();
    snapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();

    return { success: true, message: `Removidos ${snapshot.size} favoritos com sucesso.` };
  }

  // The following methods are illustrative and should be adapted if needed,
  // as their logic depends heavily on how data from other collections is handled.
  
  async getFavorite(userId, favoriteId) {
    const doc = await this._getFavoritesCollection(userId).doc(favoriteId).get();
    if (!doc.exists) throw new Error('Favorito não encontrado');
    return { id: doc.id, ...doc.data() };
  }
  
  async updateFavorite(userId, favoriteId, updateData) {
    const favoriteRef = this._getFavoritesCollection(userId).doc(favoriteId);
    await favoriteRef.update({ ...updateData, updatedAt: new Date() });
    return await this.getFavorite(userId, favoriteId);
  }

  async getFavoritesStats(userId) {
    const favorites = await this.getUserFavorites(userId);
    const totalFavorites = favorites.length;
    // Note: This is a simplified stats implementation.
    return { totalFavorites };
  }
}

module.exports = new FavoritesService(); 