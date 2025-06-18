const { db } = require('../../config/firebase');
const { calculateExpenseStats } = require('../../utils/budget');

class RoadmapBudgetService {
  /**
   * Criar orçamento para um roadmap
   */
  async createRoadmapBudget(userId, tripId, roadmapId, budgetData) {
    try {
      const budgetRef = db
        .collection('users')
        .doc(userId)
        .collection('userTrips')
        .doc(tripId)
        .collection('userRoadmapData')
        .doc(roadmapId)
        .collection('roadmapBudget');

      // Verificar se já existe um orçamento
      const existingBudget = await budgetRef.get();
      if (!existingBudget.empty) {
        throw new Error('Orçamento já existe para este roadmap');
      }

      const budget = {
        ...budgetData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await budgetRef.add(budget);
      
      return {
        id: docRef.id,
        ...budget
      };
    } catch (error) {
      throw new Error(`Erro ao criar orçamento: ${error.message}`);
    }
  }

  /**
   * Buscar orçamento de um roadmap
   */
  async getRoadmapBudget(userId, tripId, roadmapId) {
    try {
      const budgetRef = db
        .collection('users')
        .doc(userId)
        .collection('userTrips')
        .doc(tripId)
        .collection('userRoadmapData')
        .doc(roadmapId)
        .collection('roadmapBudget');

      const snapshot = await budgetRef.get();
      
      if (snapshot.empty) {
        return null;
      }

      const budgetDoc = snapshot.docs[0];
      return {
        id: budgetDoc.id,
        ...budgetDoc.data()
      };
    } catch (error) {
      throw new Error(`Erro ao buscar orçamento: ${error.message}`);
    }
  }

  /**
   * Atualizar orçamento
   */
  async updateRoadmapBudget(userId, tripId, roadmapId, updateData) {
    try {
      const budgetRef = db
        .collection('users')
        .doc(userId)
        .collection('userTrips')
        .doc(tripId)
        .collection('userRoadmapData')
        .doc(roadmapId)
        .collection('roadmapBudget');

      const snapshot = await budgetRef.get();
      
      if (snapshot.empty) {
        throw new Error('Orçamento não encontrado');
      }

      const budgetDoc = snapshot.docs[0];
      const update = {
        ...updateData,
        updatedAt: new Date()
      };

      await budgetDoc.ref.update(update);
      
      return {
        id: budgetDoc.id,
        ...budgetDoc.data(),
        ...update
      };
    } catch (error) {
      throw new Error(`Erro ao atualizar orçamento: ${error.message}`);
    }
  }

  /**
   * Deletar orçamento
   */
  async deleteRoadmapBudget(userId, tripId, roadmapId) {
    try {
      const budgetRef = db
        .collection('users')
        .doc(userId)
        .collection('userTrips')
        .doc(tripId)
        .collection('userRoadmapData')
        .doc(roadmapId)
        .collection('roadmapBudget');

      const snapshot = await budgetRef.get();
      
      if (snapshot.empty) {
        throw new Error('Orçamento não encontrado');
      }

      const budgetDoc = snapshot.docs[0];
      await budgetDoc.ref.delete();
      
      return { success: true, message: 'Orçamento deletado com sucesso' };
    } catch (error) {
      throw new Error(`Erro ao deletar orçamento: ${error.message}`);
    }
  }

  /**
   * Buscar orçamento com estatísticas calculadas
   */
  async getRoadmapBudgetWithStats(userId, tripId, roadmapId) {
    try {
      const budget = await this.getRoadmapBudget(userId, tripId, roadmapId);
      
      if (!budget) {
        return null;
      }

      // Buscar roadmapDays para calcular estatísticas
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

      // Calcular estatísticas
      const budgetStats = calculateExpenseStats(budget.totalBudget, roadmapDays);

      return {
        ...budget,
        budgetStats
      };
    } catch (error) {
      throw new Error(`Erro ao buscar orçamento com estatísticas: ${error.message}`);
    }
  }

  /**
   * Criar ou atualizar orçamento (upsert)
   */
  async upsertRoadmapBudget(userId, tripId, roadmapId, budgetData) {
    try {
      const existingBudget = await this.getRoadmapBudget(userId, tripId, roadmapId);
      
      if (existingBudget) {
        return await this.updateRoadmapBudget(userId, tripId, roadmapId, budgetData);
      } else {
        return await this.createRoadmapBudget(userId, tripId, roadmapId, budgetData);
      }
    } catch (error) {
      throw new Error(`Erro ao criar/atualizar orçamento: ${error.message}`);
    }
  }
}

module.exports = new RoadmapBudgetService(); 