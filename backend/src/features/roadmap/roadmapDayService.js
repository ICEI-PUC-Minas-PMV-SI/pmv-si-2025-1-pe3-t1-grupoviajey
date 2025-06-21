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
   * Buscar locais de um dia específico
   */
  async getPlacesInDay(userId, tripId, dayId) {
    try {
      await this._checkUserAccess(userId, tripId);
      const placesRef = db
        .collection('trips')
        .doc(tripId)
        .collection('tripDays')
        .doc(dayId)
        .collection('tripPlaces');
      
      const snapshot = await placesRef.orderBy('order').get();
      const places = [];
      
      snapshot.forEach(doc => {
        places.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return places;
    } catch (error) {
      throw new Error(`Erro ao buscar locais do dia: ${error.message}`);
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

  /**
   * Adicionar despesa a um local
   */
  async addPlaceExpense(userId, tripId, dayId, placeId, expenseData) {
    try {
      await this._checkUserAccess(userId, tripId);
      
      const expensesRef = db
        .collection('trips')
        .doc(tripId)
        .collection('tripDays')
        .doc(dayId)
        .collection('tripPlaces')
        .doc(placeId)
        .collection('tripPlaceExpenses');
      
      const expense = {
        ...expenseData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const docRef = await expensesRef.add(expense);
      return {
        id: docRef.id,
        ...expense
      };
    } catch (error) {
      throw new Error(`Erro ao adicionar despesa: ${error.message}`);
    }
  }

  /**
   * Buscar despesas de um local
   */
  async getPlaceExpenses(userId, tripId, dayId, placeId) {
    try {
      await this._checkUserAccess(userId, tripId);
      
      const expensesRef = db
        .collection('trips')
        .doc(tripId)
        .collection('tripDays')
        .doc(dayId)
        .collection('tripPlaces')
        .doc(placeId)
        .collection('tripPlaceExpenses');
      
      const snapshot = await expensesRef.orderBy('createdAt', 'desc').get();
      const expenses = [];
      
      snapshot.forEach(doc => {
        expenses.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return expenses;
    } catch (error) {
      throw new Error(`Erro ao buscar despesas: ${error.message}`);
    }
  }

  /**
   * Atualizar despesa de um local
   */
  async updatePlaceExpense(userId, tripId, dayId, placeId, expenseId, updateData) {
    try {
      await this._checkUserAccess(userId, tripId);
      
      const expenseRef = db
        .collection('trips')
        .doc(tripId)
        .collection('tripDays')
        .doc(dayId)
        .collection('tripPlaces')
        .doc(placeId)
        .collection('tripPlaceExpenses')
        .doc(expenseId);
      
      const doc = await expenseRef.get();
      if (!doc.exists) {
        throw new Error('Despesa não encontrada');
      }
      
      const update = {
        ...updateData,
        updatedAt: new Date()
      };
      
      await expenseRef.update(update);
      
      return {
        id: doc.id,
        ...doc.data(),
        ...update
      };
    } catch (error) {
      throw new Error(`Erro ao atualizar despesa: ${error.message}`);
    }
  }

  /**
   * Deletar despesa de um local
   */
  async deletePlaceExpense(userId, tripId, dayId, placeId, expenseId) {
    try {
      await this._checkUserAccess(userId, tripId);
      
      const expenseRef = db
        .collection('trips')
        .doc(tripId)
        .collection('tripDays')
        .doc(dayId)
        .collection('tripPlaces')
        .doc(placeId)
        .collection('tripPlaceExpenses')
        .doc(expenseId);
      
      const doc = await expenseRef.get();
      if (!doc.exists) {
        throw new Error('Despesa não encontrada');
      }
      
      await expenseRef.delete();
      return { success: true, message: 'Despesa removida com sucesso' };
    } catch (error) {
      throw new Error(`Erro ao deletar despesa: ${error.message}`);
    }
  }

  /**
   * Adicionar nota a um local
   */
  async addPlaceNote(userId, tripId, dayId, placeId, noteData) {
    try {
      await this._checkUserAccess(userId, tripId);
      
      const notesRef = db
        .collection('trips')
        .doc(tripId)
        .collection('tripDays')
        .doc(dayId)
        .collection('tripPlaces')
        .doc(placeId)
        .collection('tripPlaceNotes');
      
      const note = {
        ...noteData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const docRef = await notesRef.add(note);
      return {
        id: docRef.id,
        ...note
      };
    } catch (error) {
      throw new Error(`Erro ao adicionar nota: ${error.message}`);
    }
  }

  /**
   * Buscar notas de um local
   */
  async getPlaceNotes(userId, tripId, dayId, placeId) {
    try {
      await this._checkUserAccess(userId, tripId);
      
      const notesRef = db
        .collection('trips')
        .doc(tripId)
        .collection('tripDays')
        .doc(dayId)
        .collection('tripPlaces')
        .doc(placeId)
        .collection('tripPlaceNotes');
      
      const snapshot = await notesRef.orderBy('createdAt', 'desc').get();
      const notes = [];
      
      snapshot.forEach(doc => {
        notes.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return notes;
    } catch (error) {
      throw new Error(`Erro ao buscar notas: ${error.message}`);
    }
  }

  /**
   * Atualizar nota de um local
   */
  async updatePlaceNote(userId, tripId, dayId, placeId, noteId, updateData) {
    try {
      await this._checkUserAccess(userId, tripId);
      
      const noteRef = db
        .collection('trips')
        .doc(tripId)
        .collection('tripDays')
        .doc(dayId)
        .collection('tripPlaces')
        .doc(placeId)
        .collection('tripPlaceNotes')
        .doc(noteId);
      
      const doc = await noteRef.get();
      if (!doc.exists) {
        throw new Error('Nota não encontrada');
      }
      
      const update = {
        ...updateData,
        updatedAt: new Date()
      };
      
      await noteRef.update(update);
      
      return {
        id: doc.id,
        ...doc.data(),
        ...update
      };
    } catch (error) {
      throw new Error(`Erro ao atualizar nota: ${error.message}`);
    }
  }

  /**
   * Deletar nota de um local
   */
  async deletePlaceNote(userId, tripId, dayId, placeId, noteId) {
    try {
      await this._checkUserAccess(userId, tripId);
      
      const noteRef = db
        .collection('trips')
        .doc(tripId)
        .collection('tripDays')
        .doc(dayId)
        .collection('tripPlaces')
        .doc(placeId)
        .collection('tripPlaceNotes')
        .doc(noteId);
      
      const doc = await noteRef.get();
      if (!doc.exists) {
        throw new Error('Nota não encontrada');
      }
      
      await noteRef.delete();
      return { success: true, message: 'Nota removida com sucesso' };
    } catch (error) {
      throw new Error(`Erro ao deletar nota: ${error.message}`);
    }
  }
}

module.exports = new RoadmapDayService(); 