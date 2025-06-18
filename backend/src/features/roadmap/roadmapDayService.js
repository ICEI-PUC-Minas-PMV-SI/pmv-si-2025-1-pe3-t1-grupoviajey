const { db } = require('../../config/firebase');

class RoadmapDayService {
  /**
   * Criar um dia no roadmap
   */
  async createRoadmapDay(userId, tripId, roadmapId, dayData) {
    try {
      const dayRef = db
        .collection('users')
        .doc(userId)
        .collection('userTrips')
        .doc(tripId)
        .collection('userRoadmapData')
        .doc(roadmapId)
        .collection('roadmapDays');

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
  async getRoadmapDays(userId, tripId, roadmapId) {
    try {
      const daysRef = db
        .collection('users')
        .doc(userId)
        .collection('userTrips')
        .doc(tripId)
        .collection('userRoadmapData')
        .doc(roadmapId)
        .collection('roadmapDays');

      const snapshot = await daysRef.orderBy('date').get();
      
      const days = [];
      for (const doc of snapshot.docs) {
        const dayData = {
          id: doc.id,
          ...doc.data()
        };

        // Buscar locais do dia
        const placesRef = doc.ref.collection('places');
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
  async getRoadmapDay(userId, tripId, roadmapId, dayId) {
    try {
      const dayRef = db
        .collection('users')
        .doc(userId)
        .collection('userTrips')
        .doc(tripId)
        .collection('userRoadmapData')
        .doc(roadmapId)
        .collection('roadmapDays')
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
      const placesRef = dayRef.collection('places');
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
   * Atualizar um dia do roadmap
   */
  async updateRoadmapDay(userId, tripId, roadmapId, dayId, updateData) {
    try {
      const dayRef = db
        .collection('users')
        .doc(userId)
        .collection('userTrips')
        .doc(tripId)
        .collection('userRoadmapData')
        .doc(roadmapId)
        .collection('roadmapDays')
        .doc(dayId);

      const update = {
        ...updateData,
        updatedAt: new Date()
      };

      await dayRef.update(update);
      
      return await this.getRoadmapDay(userId, tripId, roadmapId, dayId);
    } catch (error) {
      throw new Error(`Erro ao atualizar dia do roadmap: ${error.message}`);
    }
  }

  /**
   * Deletar um dia do roadmap
   */
  async deleteRoadmapDay(userId, tripId, roadmapId, dayId) {
    try {
      const dayRef = db
        .collection('users')
        .doc(userId)
        .collection('userTrips')
        .doc(tripId)
        .collection('userRoadmapData')
        .doc(roadmapId)
        .collection('roadmapDays')
        .doc(dayId);

      const doc = await dayRef.get();
      if (!doc.exists) {
        throw new Error('Dia do roadmap não encontrado');
      }

      await dayRef.delete();
      
      return { success: true, message: 'Dia do roadmap deletado com sucesso' };
    } catch (error) {
      throw new Error(`Erro ao deletar dia do roadmap: ${error.message}`);
    }
  }

  /**
   * Adicionar local a um dia do roadmap
   */
  async addPlaceToDay(userId, tripId, roadmapId, dayId, placeData) {
    try {
      const placesRef = db
        .collection('users')
        .doc(userId)
        .collection('userTrips')
        .doc(tripId)
        .collection('userRoadmapData')
        .doc(roadmapId)
        .collection('roadmapDays')
        .doc(dayId)
        .collection('places');

      const place = {
        ...placeData,
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
   * Atualizar local de um dia
   */
  async updatePlaceInDay(userId, tripId, roadmapId, dayId, placeId, updateData) {
    try {
      const placeRef = db
        .collection('users')
        .doc(userId)
        .collection('userTrips')
        .doc(tripId)
        .collection('userRoadmapData')
        .doc(roadmapId)
        .collection('roadmapDays')
        .doc(dayId)
        .collection('places')
        .doc(placeId);

      const update = {
        ...updateData,
        updatedAt: new Date()
      };

      await placeRef.update(update);
      
      const doc = await placeRef.get();
      return {
        id: doc.id,
        ...doc.data()
      };
    } catch (error) {
      throw new Error(`Erro ao atualizar local do dia: ${error.message}`);
    }
  }

  /**
   * Remover local de um dia
   */
  async removePlaceFromDay(userId, tripId, roadmapId, dayId, placeId) {
    try {
      const placeRef = db
        .collection('users')
        .doc(userId)
        .collection('userTrips')
        .doc(tripId)
        .collection('userRoadmapData')
        .doc(roadmapId)
        .collection('roadmapDays')
        .doc(dayId)
        .collection('places')
        .doc(placeId);

      const doc = await placeRef.get();
      if (!doc.exists) {
        throw new Error('Local não encontrado');
      }

      await placeRef.delete();
      
      return { success: true, message: 'Local removido com sucesso' };
    } catch (error) {
      throw new Error(`Erro ao remover local do dia: ${error.message}`);
    }
  }
}

module.exports = new RoadmapDayService(); 