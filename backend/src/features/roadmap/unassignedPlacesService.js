const { db } = require('../../config/firebase');

class UnassignedPlacesService {
  /**
   * Adicionar local não atribuído
   */
  async addUnassignedPlace(userId, tripId, placeData) {
    try {
      // Verificar se o usuário tem acesso à trip
      const tripRef = db.collection('trips').doc(tripId);
      const tripDoc = await tripRef.get();
      
      if (!tripDoc.exists) {
        throw new Error('Viagem não encontrada');
      }
      
      const tripData = tripDoc.data();
      if (tripData.ownerId !== userId && !tripData.collaborators.includes(userId)) {
        throw new Error('Acesso negado: você não tem permissão para acessar esta viagem');
      }

      const placesRef = db
        .collection('trips')
        .doc(tripId)
        .collection('unassignedPlaces');

      // Remover campos que não devem existir em unassignedPlaces
      const { notes, expenses, ...cleanPlaceData } = placeData;

      const place = {
        ...cleanPlaceData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await placesRef.add(place);
      
      return {
        id: docRef.id,
        ...place
      };
    } catch (error) {
      throw new Error(`Erro ao adicionar local não atribuído: ${error.message}`);
    }
  }

  /**
   * Buscar todos os locais não atribuídos
   */
  async getUnassignedPlaces(userId, tripId) {
    try {
      // Verificar se o usuário tem acesso à trip
      const tripRef = db.collection('trips').doc(tripId);
      const tripDoc = await tripRef.get();
      
      if (!tripDoc.exists) {
        throw new Error('Viagem não encontrada');
      }
      
      const tripData = tripDoc.data();
      if (tripData.ownerId !== userId && !tripData.collaborators.includes(userId)) {
        throw new Error('Acesso negado: você não tem permissão para acessar esta viagem');
      }

      const placesRef = db
        .collection('trips')
        .doc(tripId)
        .collection('unassignedPlaces');

      const snapshot = await placesRef.orderBy('createdAt', 'desc').get();
      
      const places = [];
      snapshot.forEach(doc => {
        places.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return places;
    } catch (error) {
      throw new Error(`Erro ao buscar locais não atribuídos: ${error.message}`);
    }
  }

  /**
   * Remover local não atribuído
   */
  async removeUnassignedPlace(userId, tripId, placeId) {
    try {
      // Verificar se o usuário tem acesso à trip
      const tripRef = db.collection('trips').doc(tripId);
      const tripDoc = await tripRef.get();
      
      if (!tripDoc.exists) {
        throw new Error('Viagem não encontrada');
      }
      
      const tripData = tripDoc.data();
      if (tripData.ownerId !== userId && !tripData.collaborators.includes(userId)) {
        throw new Error('Acesso negado: você não tem permissão para editar esta viagem');
      }

      const placeRef = db
        .collection('trips')
        .doc(tripId)
        .collection('unassignedPlaces')
        .doc(placeId);

      const doc = await placeRef.get();
      if (!doc.exists) {
        throw new Error('Local não atribuído não encontrado');
      }

      await placeRef.delete();
      
      return { success: true, message: 'Local não atribuído removido com sucesso' };
    } catch (error) {
      throw new Error(`Erro ao remover local não atribuído: ${error.message}`);
    }
  }
}

module.exports = new UnassignedPlacesService(); 