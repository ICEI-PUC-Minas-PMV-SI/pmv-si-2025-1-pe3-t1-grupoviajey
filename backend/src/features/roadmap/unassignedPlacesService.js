const { db } = require('../../config/firebase');

class UnassignedPlacesService {
  /**
   * Adicionar local não atribuído
   */
  async addUnassignedPlace(userId, tripId, roadmapId, placeData) {
    try {
      const placesRef = db
        .collection('users')
        .doc(userId)
        .collection('userTrips')
        .doc(tripId)
        .collection('userRoadmapData')
        .doc(roadmapId)
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
  async getUnassignedPlaces(userId, tripId, roadmapId) {
    try {
      const placesRef = db
        .collection('users')
        .doc(userId)
        .collection('userTrips')
        .doc(tripId)
        .collection('userRoadmapData')
        .doc(roadmapId)
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
  async getUnassignedPlace(userId, tripId, roadmapId, placeId) {
    try {
      const placeRef = db
        .collection('users')
        .doc(userId)
        .collection('userTrips')
        .doc(tripId)
        .collection('userRoadmapData')
        .doc(roadmapId)
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
   * Atualizar local não atribuído
   */
  async updateUnassignedPlace(userId, tripId, roadmapId, placeId, updateData) {
    try {
      const placeRef = db
        .collection('users')
        .doc(userId)
        .collection('userTrips')
        .doc(tripId)
        .collection('userRoadmapData')
        .doc(roadmapId)
        .collection('unassignedPlaces')
        .doc(placeId);

      // Remover campos que não devem existir em unassignedPlaces
      const { notes, expenses, ...cleanUpdateData } = updateData;

      const update = {
        ...cleanUpdateData,
        updatedAt: new Date()
      };

      await placeRef.update(update);
      
      return await this.getUnassignedPlace(userId, tripId, roadmapId, placeId);
    } catch (error) {
      throw new Error(`Erro ao atualizar local não atribuído: ${error.message}`);
    }
  }

  /**
   * Remover local não atribuído
   */
  async removeUnassignedPlace(userId, tripId, roadmapId, placeId) {
    try {
      const placeRef = db
        .collection('users')
        .doc(userId)
        .collection('userTrips')
        .doc(tripId)
        .collection('userRoadmapData')
        .doc(roadmapId)
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
  async moveToDay(userId, tripId, roadmapId, placeId, dayId, additionalData = {}) {
    try {
      // Buscar o local não atribuído
      const unassignedPlace = await this.getUnassignedPlace(userId, tripId, roadmapId, placeId);
      
      // Preparar dados do local para o dia (pode incluir notas e gastos)
      const placeData = {
        placeId: unassignedPlace.placeId,
        name: unassignedPlace.name,
        address: unassignedPlace.address,
        location: unassignedPlace.location,
        ...additionalData // Pode incluir notes e expenses
      };

      // Adicionar ao dia usando o service de roadmapDays
      const roadmapDayService = require('./roadmapDayService');
      const newPlace = await roadmapDayService.addPlaceToDay(userId, tripId, roadmapId, dayId, placeData);
      
      // Remover do unassignedPlaces
      await this.removeUnassignedPlace(userId, tripId, roadmapId, placeId);
      
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