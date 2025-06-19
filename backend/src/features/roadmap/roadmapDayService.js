const { db } = require('../../config/firebase');

class RoadmapDayService {
  /**
   * Método privado para verificar acesso do usuário à viagem
   */
  async _checkUserAccess(userId, tripId) {
    const tripRef = db.collection('trips').doc(tripId);
    const tripDoc = await tripRef.get();
    if (!tripDoc.exists) {
      throw new Error('Viagem não encontrada');
    }
    const tripData = tripDoc.data();
    if (tripData.ownerId !== userId && !tripData.collaborators.includes(userId)) {
      throw new Error('Acesso negado: você não tem permissão para acessar/editar esta viagem');
    }
    return tripData;
  }

  /**
   * Criar um dia no roadmap
   */
  async createRoadmapDay(userId, tripId, dayData) {
    try {
      await this._checkUserAccess(userId, tripId);
      const dayRef = db
        .collection('trips')
        .doc(tripId)
        .collection('tripDays');
      const day = {
        ...dayData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const docRef = await dayRef.add(day);
      return {
        id: docRef.id,
        ...day
      };
    } catch (error) {
      throw new Error(`Erro ao criar dia do roadmap: ${error.message}`);
    }
  }

  /**
   * Buscar todos os dias de um roadmap
   */
  async getRoadmapDays(userId, tripId) {
    try {
      await this._checkUserAccess(userId, tripId);
      const daysRef = db
        .collection('trips')
        .doc(tripId)
        .collection('tripDays');
      const snapshot = await daysRef.orderBy('date').get();
      const days = [];
      for (const doc of snapshot.docs) {
        const dayData = {
          id: doc.id,
          ...doc.data()
        };
        // Buscar locais do dia
        const placesRef = doc.ref.collection('tripPlaces');
        const placesSnapshot = await placesRef.get();
        const places = [];
        placesSnapshot.forEach(placeDoc => {
          places.push({
            id: placeDoc.id,
            ...placeDoc.data()
          });
        });
        dayData.places = places;
        days.push(dayData);
      }
      return days;
    } catch (error) {
      throw new Error(`Erro ao buscar dias do roadmap: ${error.message}`);
    }
  }

  /**
   * Buscar um dia específico
   */
  async getRoadmapDay(userId, tripId, dayId) {
    try {
      await this._checkUserAccess(userId, tripId);
      const dayRef = db
        .collection('trips')
        .doc(tripId)
        .collection('tripDays')
        .doc(dayId);
      const doc = await dayRef.get();
      if (!doc.exists) {
        throw new Error('Dia do roadmap não encontrado');
      }
      const dayData = {
        id: doc.id,
        ...doc.data()
      };
      // Buscar locais do dia
      const placesRef = dayRef.collection('tripPlaces');
      const placesSnapshot = await placesRef.get();
      const places = [];
      placesSnapshot.forEach(placeDoc => {
        places.push({
          id: placeDoc.id,
          ...placeDoc.data()
        });
      });
      dayData.places = places;
      return dayData;
    } catch (error) {
      throw new Error(`Erro ao buscar dia do roadmap: ${error.message}`);
    }
  }

  /**
   * Adicionar local a um dia do roadmap
   * Campos esperados em placeData:
   * - name (string): nome do local
   * - address (string): endereço
   * - placeId (string): id do local (Google Places ou similar)
   * - order (number): ordem do local no dia
   * - startTime (string): horário de início (opcional)
   * - endTime (string): horário de término (opcional)
   * - notes (string): observações (opcional)
   */
  async addPlaceToDay(userId, tripId, dayId, placeData) {
    try {
      await this._checkUserAccess(userId, tripId);
      // Validação dos campos obrigatórios
      if (!placeData.name || !placeData.address || !placeData.placeId || typeof placeData.order !== 'number') {
        throw new Error('Campos obrigatórios ausentes para o local: name, address, placeId, order');
      }
      const placesRef = db
        .collection('trips')
        .doc(tripId)
        .collection('tripDays')
        .doc(dayId)
        .collection('tripPlaces');
      const place = {
        name: placeData.name,
        address: placeData.address,
        placeId: placeData.placeId,
        order: placeData.order,
        startTime: placeData.startTime || null,
        endTime: placeData.endTime || null,
        notes: placeData.notes || '',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const docRef = await placesRef.add(place);
      return {
        id: docRef.id,
        ...place
      };
    } catch (error) {
      throw new Error(`Erro ao adicionar local ao dia: ${error.message}`);
    }
  }

  /**
   * Remover local de um dia do roadmap
   */
  async removePlaceFromDay(userId, tripId, dayId, placeId) {
    try {
      await this._checkUserAccess(userId, tripId);
      const placeRef = db
        .collection('trips')
        .doc(tripId)
        .collection('tripDays')
        .doc(dayId)
        .collection('tripPlaces')
        .doc(placeId);
      const doc = await placeRef.get();
      if (!doc.exists) {
        throw new Error('Local não encontrado');
      }
      await placeRef.delete();
      return { success: true, message: 'Local removido do dia com sucesso' };
    } catch (error) {
      throw new Error(`Erro ao remover local do dia: ${error.message}`);
    }
  }
}

module.exports = new RoadmapDayService(); 