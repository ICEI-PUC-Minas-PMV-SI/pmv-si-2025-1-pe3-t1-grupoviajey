const { db } = require('../../config/firebase');
const { calculateExpenseStats } = require('../../utils/budget');

class RoadmapService {
  /**
   * Criar roadmap para uma viagem
   */
  async createRoadmap(userId, tripId, roadmapData) {
    try {
      const roadmapRef = db
        .collection('users')
        .doc(userId)
        .collection('userTrips')
        .doc(tripId)
        .collection('userRoadmapData');

      const roadmap = {
        ...roadmapData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await roadmapRef.add(roadmap);
      
      return {
        id: docRef.id,
        ...roadmap
      };
    } catch (error) {
      throw new Error(`Erro ao criar roadmap: ${error.message}`);
    }
  }

  /**
   * Buscar roadmap de uma viagem
   */
  async getRoadmap(userId, tripId, roadmapId) {
    try {
      const roadmapRef = db
        .collection('users')
        .doc(userId)
        .collection('userTrips')
        .doc(tripId)
        .collection('userRoadmapData')
        .doc(roadmapId);

      const doc = await roadmapRef.get();
      
      if (!doc.exists) {
        throw new Error('Roadmap não encontrado');
      }
      
      return {
        id: doc.id,
        ...doc.data()
      };
    } catch (error) {
      throw new Error(`Erro ao buscar roadmap: ${error.message}`);
    }
  }

  /**
   * Atualizar roadmap
   */
  async updateRoadmap(userId, tripId, roadmapId, updateData) {
    try {
      const roadmapRef = db
        .collection('users')
        .doc(userId)
        .collection('userTrips')
        .doc(tripId)
        .collection('userRoadmapData')
        .doc(roadmapId);

      const update = {
        ...updateData,
        updatedAt: new Date()
      };

      await roadmapRef.update(update);
      
      return await this.getRoadmap(userId, tripId, roadmapId);
    } catch (error) {
      throw new Error(`Erro ao atualizar roadmap: ${error.message}`);
    }
  }

  /**
   * Deletar roadmap
   */
  async deleteRoadmap(userId, tripId, roadmapId) {
    try {
      const roadmapRef = db
        .collection('users')
        .doc(userId)
        .collection('userTrips')
        .doc(tripId)
        .collection('userRoadmapData')
        .doc(roadmapId);

      const doc = await roadmapRef.get();
      if (!doc.exists) {
        throw new Error('Roadmap não encontrado');
      }

      await roadmapRef.delete();
      
      return { success: true, message: 'Roadmap deletado com sucesso' };
    } catch (error) {
      throw new Error(`Erro ao deletar roadmap: ${error.message}`);
    }
  }

  /**
   * Buscar roadmap com estatísticas de orçamento
   */
  async getRoadmapWithBudgetStats(userId, tripId, roadmapId) {
    try {
      const roadmap = await this.getRoadmap(userId, tripId, roadmapId);
      
      // Buscar roadmapBudget
      const budgetRef = db
        .collection('users')
        .doc(userId)
        .collection('userTrips')
        .doc(tripId)
        .collection('userRoadmapData')
        .doc(roadmapId)
        .collection('roadmapBudget');

      const budgetSnapshot = await budgetRef.get();
      let budget = null;
      
      if (!budgetSnapshot.empty) {
        const budgetDoc = budgetSnapshot.docs[0];
        budget = {
          id: budgetDoc.id,
          ...budgetDoc.data()
        };
      }

      // Buscar roadmapDays
      const daysRef = db
        .collection('users')
        .doc(userId)
        .collection('userTrips')
        .doc(tripId)
        .collection('userRoadmapData')
        .doc(roadmapId)
        .collection('roadmapDays');

      const daysSnapshot = await daysRef.orderBy('date').get();
      const roadmapDays = [];
      
      for (const dayDoc of daysSnapshot.docs) {
        const dayData = {
          id: dayDoc.id,
          ...dayDoc.data()
        };

        // Buscar locais do dia
        const placesRef = dayDoc.ref.collection('places');
        const placesSnapshot = await placesRef.get();
        const places = [];
        
        placesSnapshot.forEach(placeDoc => {
          places.push({
            id: placeDoc.id,
            ...placeDoc.data()
          });
        });

        dayData.places = places;
        roadmapDays.push(dayData);
      }

      // Calcular estatísticas de orçamento
      let budgetStats = null;
      if (budget && budget.totalBudget) {
        budgetStats = calculateExpenseStats(budget.totalBudget, roadmapDays);
      }

      return {
        ...roadmap,
        roadmapDays,
        roadmapBudget: budget,
        budgetStats
      };
    } catch (error) {
      throw new Error(`Erro ao buscar roadmap com estatísticas: ${error.message}`);
    }
  }
}

module.exports = new RoadmapService(); 