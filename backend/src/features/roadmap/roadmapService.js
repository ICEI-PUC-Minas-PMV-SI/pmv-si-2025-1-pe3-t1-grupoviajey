const { db } = require('../../config/firebase');
const { calculateExpenseStats } = require('../../utils/budget');

class RoadmapService {
  /**
   * Criar roadmap para uma viagem (agora os dados ficam diretamente na trip)
   */
  async createRoadmap(userId, tripId, roadmapData) {
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

      // Atualizar a trip com os dados do roadmap
      const update = {
        ...roadmapData,
        updatedAt: new Date()
      };

      await tripRef.update(update);
      
      return {
        id: tripId,
        ...tripData,
        ...update
      };
    } catch (error) {
      throw new Error(`Erro ao criar roadmap: ${error.message}`);
    }
  }

  /**
   * Buscar roadmap de uma viagem
   */
  async getRoadmap(userId, tripId) {
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
      throw new Error(`Erro ao buscar roadmap: ${error.message}`);
    }
  }

  /**
   * Atualizar roadmap
   */
  async updateRoadmap(userId, tripId, updateData) {
    try {
      const tripRef = db.collection('trips').doc(tripId);
      
      // Verificar se o usuário tem acesso à viagem
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
      
      return await this.getRoadmap(userId, tripId);
    } catch (error) {
      throw new Error(`Erro ao atualizar roadmap: ${error.message}`);
    }
  }

  /**
   * Deletar roadmap (não é mais necessário, pois os dados ficam na trip)
   */
  async deleteRoadmap(userId, tripId) {
    try {
      // Verificar se o usuário é o owner da trip
      const tripRef = db.collection('trips').doc(tripId);
      const doc = await tripRef.get();
      
      if (!doc.exists) {
        throw new Error('Viagem não encontrada');
      }
      
      const tripData = doc.data();
      if (tripData.ownerId !== userId) {
        throw new Error('Acesso negado: apenas o proprietário pode deletar a viagem');
      }

      // Deletar a trip e todas as subcoleções
      await tripRef.delete();
      
      return { success: true, message: 'Viagem deletada com sucesso' };
    } catch (error) {
      throw new Error(`Erro ao deletar roadmap: ${error.message}`);
    }
  }

  /**
   * Buscar roadmap com estatísticas de orçamento
   */
  async getRoadmapWithBudgetStats(userId, tripId) {
    try {
      const roadmap = await this.getRoadmap(userId, tripId);
      
      // Buscar tripBudget
      const budgetRef = db
        .collection('trips')
        .doc(tripId)
        .collection('tripBudget');

      const budgetSnapshot = await budgetRef.get();
      let budget = null;
      
      if (!budgetSnapshot.empty) {
        const budgetDoc = budgetSnapshot.docs[0];
        budget = {
          id: budgetDoc.id,
          ...budgetDoc.data()
        };
      }

      // Buscar tripDays
      const daysRef = db
        .collection('trips')
        .doc(tripId)
        .collection('tripDays');

      const daysSnapshot = await daysRef.orderBy('date').get();
      const tripDays = [];
      
      for (const dayDoc of daysSnapshot.docs) {
        const dayData = {
          id: dayDoc.id,
          ...dayDoc.data()
        };

        // Buscar locais do dia
        const placesRef = dayDoc.ref.collection('tripPlaces');
        const placesSnapshot = await placesRef.get();
        const places = [];
        
        placesSnapshot.forEach(placeDoc => {
          places.push({
            id: placeDoc.id,
            ...placeDoc.data()
          });
        });

        dayData.places = places;
        tripDays.push(dayData);
      }

      // Calcular estatísticas de orçamento
      let budgetStats = null;
      if (budget && budget.totalBudget) {
        budgetStats = calculateExpenseStats(budget.totalBudget, tripDays);
      }

      return {
        ...roadmap,
        tripDays,
        tripBudget: budget,
        budgetStats
      };
    } catch (error) {
      throw new Error(`Erro ao buscar roadmap com estatísticas: ${error.message}`);
    }
  }
}

module.exports = new RoadmapService(); 