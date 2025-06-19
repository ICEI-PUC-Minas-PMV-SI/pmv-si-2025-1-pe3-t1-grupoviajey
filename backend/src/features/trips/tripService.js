const { db } = require('../../config/firebase');

class TripService {
  /**
   * Criar uma nova viagem
   */
  async createTrip(userId, tripData) {
    try {
      const tripRef = db.collection('trips');
      
      const trip = {
        ...tripData,
        ownerId: userId,
        collaborators: [userId], // O criador é automaticamente um colaborador
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await tripRef.add(trip);
      
      // Criar tripDays automaticamente
      const tripDaysRef = db.collection('trips').doc(docRef.id).collection('tripDays');
      const days = TripService.getDateRange(trip.startDate, trip.endDate);
      for (const date of days) {
        await tripDaysRef.add({ date, places: [] });
      }
      
      return {
        id: docRef.id,
        ...trip
      };
    } catch (error) {
      throw new Error(`Erro ao criar viagem: ${error.message}`);
    }
  }

  /**
   * Buscar todas as viagens de um usuário (como owner ou collaborator)
   */
  async getUserTrips(userId) {
    try {
      // Buscar viagens onde o usuário é owner
      const ownerTripsRef = db.collection('trips').where('ownerId', '==', userId);
      const ownerSnapshot = await ownerTripsRef.orderBy('createdAt', 'desc').get();
      
      // Buscar viagens onde o usuário é collaborator
      const collaboratorTripsRef = db.collection('trips').where('collaborators', 'array-contains', userId);
      const collaboratorSnapshot = await collaboratorTripsRef.orderBy('createdAt', 'desc').get();
      
      const trips = [];
      
      // Adicionar viagens onde é owner
      ownerSnapshot.forEach(doc => {
        trips.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      // Adicionar viagens onde é collaborator (evitando duplicatas)
      collaboratorSnapshot.forEach(doc => {
        const tripData = doc.data();
        if (tripData.ownerId !== userId) { // Evitar duplicatas
          trips.push({
            id: doc.id,
            ...tripData
          });
        }
      });
      
      // Ordenar por data de criação (mais recente primeiro)
      trips.sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate());
      
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
      const tripRef = db.collection('trips').doc(tripId);
      const doc = await tripRef.get();
      
      if (!doc.exists) {
        throw new Error('Viagem não encontrada');
      }
      
      const tripData = doc.data();
      
      // Verificar se o usuário tem acesso à viagem
      if (tripData.ownerId !== userId && !tripData.collaborators.includes(userId)) {
        throw new Error('Acesso negado: você não tem permissão para acessar esta viagem');
      }
      
      return {
        id: doc.id,
        ...tripData
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
      const tripRef = db.collection('trips').doc(tripId);
      
      // Verificar se o usuário tem permissão para editar
      const doc = await tripRef.get();
      if (!doc.exists) {
        throw new Error('Viagem não encontrada');
      }
      
      const tripData = doc.data();
      if (tripData.ownerId !== userId && !tripData.collaborators.includes(userId)) {
        throw new Error('Acesso negado: você não tem permissão para editar esta viagem');
      }
      
      const update = {
        ...updateData,
        updatedAt: new Date()
      };

      await tripRef.update(update);
      
      // Sincronizar tripDays automaticamente
      if (update.startDate && update.endDate) {
        const tripDaysRef = db.collection('trips').doc(tripId).collection('tripDays');
        const days = TripService.getDateRange(update.startDate, update.endDate);
        const existingDaysSnapshot = await tripDaysRef.get();
        const existingDates = [];
        existingDaysSnapshot.forEach(doc => {
          existingDates.push({ id: doc.id, date: doc.data().date });
        });
        // Adicionar dias novos
        for (const date of days) {
          if (!existingDates.find(d => d.date === date)) {
            await tripDaysRef.add({ date, places: [] });
          }
        }
        // Remover dias que não estão mais no range
        for (const d of existingDates) {
          if (!days.includes(d.date)) {
            await tripDaysRef.doc(d.id).delete();
          }
        }
      }
      
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
      const tripRef = db.collection('trips').doc(tripId);
      
      // Verificar se a viagem existe e se o usuário é o owner
      const doc = await tripRef.get();
      if (!doc.exists) {
        throw new Error('Viagem não encontrada');
      }
      
      const tripData = doc.data();
      if (tripData.ownerId !== userId) {
        throw new Error('Acesso negado: apenas o proprietário pode deletar a viagem');
      }

      // Deletar a viagem e todas as subcoleções
      await tripRef.delete();
      
      return { success: true, message: 'Viagem deletada com sucesso' };
    } catch (error) {
      throw new Error(`Erro ao deletar viagem: ${error.message}`);
    }
  }

  /**
   * Verificar se uma viagem pertence ao usuário ou se ele tem acesso
   */
  async verifyTripAccess(userId, tripId) {
    try {
      const tripRef = db.collection('trips').doc(tripId);
      const doc = await tripRef.get();
      
      if (!doc.exists) {
        return false;
      }
      
      const tripData = doc.data();
      return tripData.ownerId === userId || tripData.collaborators.includes(userId);
    } catch (error) {
      return false;
    }
  }

  /**
   * Verificar se o usuário é o owner da viagem
   */
  async verifyTripOwnership(userId, tripId) {
    try {
      const tripRef = db.collection('trips').doc(tripId);
      const doc = await tripRef.get();
      
      if (!doc.exists) {
        return false;
      }
      
      const tripData = doc.data();
      return tripData.ownerId === userId;
    } catch (error) {
      return false;
    }
  }

  /**
   * Adicionar colaborador à viagem
   */
  async addCollaborator(userId, tripId, collaboratorId) {
    try {
      const tripRef = db.collection('trips').doc(tripId);
      
      // Verificar se o usuário é o owner
      const doc = await tripRef.get();
      if (!doc.exists) {
        throw new Error('Viagem não encontrada');
      }
      
      const tripData = doc.data();
      if (tripData.ownerId !== userId) {
        throw new Error('Acesso negado: apenas o proprietário pode adicionar colaboradores');
      }
      
      // Verificar se o colaborador já existe
      if (tripData.collaborators.includes(collaboratorId)) {
        throw new Error('Usuário já é colaborador desta viagem');
      }
      
      // Adicionar colaborador
      await tripRef.update({
        collaborators: [...tripData.collaborators, collaboratorId],
        updatedAt: new Date()
      });
      
      return { success: true, message: 'Colaborador adicionado com sucesso' };
    } catch (error) {
      throw new Error(`Erro ao adicionar colaborador: ${error.message}`);
    }
  }

  /**
   * Remover colaborador da viagem
   */
  async removeCollaborator(userId, tripId, collaboratorId) {
    try {
      const tripRef = db.collection('trips').doc(tripId);
      
      // Verificar se o usuário é o owner
      const doc = await tripRef.get();
      if (!doc.exists) {
        throw new Error('Viagem não encontrada');
      }
      
      const tripData = doc.data();
      if (tripData.ownerId !== userId) {
        throw new Error('Acesso negado: apenas o proprietário pode remover colaboradores');
      }
      
      // Verificar se o colaborador existe
      if (!tripData.collaborators.includes(collaboratorId)) {
        throw new Error('Usuário não é colaborador desta viagem');
      }
      
      // Remover colaborador
      const updatedCollaborators = tripData.collaborators.filter(id => id !== collaboratorId);
      await tripRef.update({
        collaborators: updatedCollaborators,
        updatedAt: new Date()
      });
      
      return { success: true, message: 'Colaborador removido com sucesso' };
    } catch (error) {
      throw new Error(`Erro ao remover colaborador: ${error.message}`);
    }
  }

  static getDateRange(startDate, endDate) {
    const dates = [];
    let current = new Date(startDate);
    const end = new Date(endDate);
    while (current <= end) {
      dates.push(current.toISOString().slice(0, 10));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  }

  static getTripDaysFromRange(startDate, endDate) {
    const diasSemana = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    const days = [];
    let current = new Date(startDate);
    const end = new Date(endDate);
    let dayNumber = 1;
    while (current <= end) {
      days.push({
        dayNumber,
        date: current.toISOString().slice(0, 10),
        dayOfWeek: diasSemana[current.getDay()]
      });
      current.setDate(current.getDate() + 1);
      dayNumber++;
    }
    return days;
  }

  async getTripDays(tripId) {
    const tripRef = db.collection('trips').doc(tripId);
    const doc = await tripRef.get();
    if (!doc.exists) {
      throw new Error('Viagem não encontrada');
    }
    const trip = doc.data();
    if (!trip.startDate || !trip.endDate) {
      const err = new Error('Start date or end date is missing for this trip.');
      err.status = 400;
      throw err;
    }
    return TripService.getTripDaysFromRange(trip.startDate, trip.endDate);
  }
}

module.exports = new TripService(); 