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
   * Buscar local não atribuído específico
   */
  async getUnassignedPlace(userId, tripId, placeId) {
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

      const placeRef = db
        .collection('trips')
        .doc(tripId)
        .collection('unassignedPlaces')
        .doc(placeId);

      const doc = await placeRef.get();
      
      if (!doc.exists) {
        throw new Error('Local não atribuído não encontrado');
      }
      
      return {
        id: doc.id,
        ...doc.data()
      };
    } catch (error) {
      throw new Error(`Erro ao buscar local não atribuído: ${error.message}`);
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

  /**
   * Mover local não atribuído para um dia específico
   */
  async moveUnassignedPlaceToDay(userId, tripId, placeId, dayId) {
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

      // Buscar o local não atribuído
      const unassignedPlace = await this.getUnassignedPlace(userId, tripId, placeId);
      
      // Preparar dados do local para o dia
      const placeData = {
        placeId: unassignedPlace.placeId,
        name: unassignedPlace.name,
        address: unassignedPlace.address,
        location: unassignedPlace.location
      };

      // Adicionar ao dia usando o service de roadmapDays
      const roadmapDayService = require('./roadmapDayService');
      const newPlace = await roadmapDayService.addPlaceToDay(userId, tripId, dayId, placeData);
      
      // Remover do unassignedPlaces
      await this.removeUnassignedPlace(userId, tripId, placeId);
      
      return {
        success: true,
        message: 'Local movido para o dia com sucesso',
        place: newPlace
      };
    } catch (error) {
      throw new Error(`Erro ao mover local para o dia: ${error.message}`);
    }
  }
}

module.exports = new UnassignedPlacesService(); 