const { db } = require('../../config/firebase');

class TripService {
  /**
   * Criar uma nova viagem
   */
  async createTrip(userId, tripData) {
    try {
      const tripRef = db.collection('users').doc(userId).collection('userTrips');
      
      const trip = {
        ...tripData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await tripRef.add(trip);
      
      return {
        id: docRef.id,
        ...trip
      };
    } catch (error) {
      throw new Error(`Erro ao criar viagem: ${error.message}`);
    }
  }

  /**
   * Buscar todas as viagens de um usuário
   */
  async getUserTrips(userId) {
    try {
      const tripsRef = db.collection('users').doc(userId).collection('userTrips');
      const snapshot = await tripsRef.orderBy('createdAt', 'desc').get();
      
      const trips = [];
      snapshot.forEach(doc => {
        trips.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return trips;
    } catch (error) {
      throw new Error(`Erro ao buscar viagens: ${error.message}`);
    }
  }

  /**
   * Buscar uma viagem específica
   */
  async getTrip(userId, tripId) {
    try {
      const tripRef = db.collection('users').doc(userId).collection('userTrips').doc(tripId);
      const doc = await tripRef.get();
      
      if (!doc.exists) {
        throw new Error('Viagem não encontrada');
      }
      
      return {
        id: doc.id,
        ...doc.data()
      };
    } catch (error) {
      throw new Error(`Erro ao buscar viagem: ${error.message}`);
    }
  }

  /**
   * Atualizar uma viagem
   */
  async updateTrip(userId, tripId, updateData) {
    try {
      const tripRef = db.collection('users').doc(userId).collection('userTrips').doc(tripId);
      
      const update = {
        ...updateData,
        updatedAt: new Date()
      };

      await tripRef.update(update);
      
      return await this.getTrip(userId, tripId);
    } catch (error) {
      throw new Error(`Erro ao atualizar viagem: ${error.message}`);
    }
  }

  /**
   * Deletar uma viagem
   */
  async deleteTrip(userId, tripId) {
    try {
      const tripRef = db.collection('users').doc(userId).collection('userTrips').doc(tripId);
      
      // Verificar se a viagem existe
      const doc = await tripRef.get();
      if (!doc.exists) {
        throw new Error('Viagem não encontrada');
      }

      // Deletar a viagem e todas as subcoleções
      await tripRef.delete();
      
      return { success: true, message: 'Viagem deletada com sucesso' };
    } catch (error) {
      throw new Error(`Erro ao deletar viagem: ${error.message}`);
    }
  }

  /**
   * Verificar se uma viagem pertence ao usuário
   */
  async verifyTripOwnership(userId, tripId) {
    try {
      const tripRef = db.collection('users').doc(userId).collection('userTrips').doc(tripId);
      const doc = await tripRef.get();
      
      return doc.exists;
    } catch (error) {
      return false;
    }
  }
}

module.exports = new TripService(); 