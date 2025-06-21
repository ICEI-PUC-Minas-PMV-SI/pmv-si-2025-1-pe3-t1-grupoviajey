const { db } = require('../../config/firebase');
const { calculateExpenseStats } = require('./budget');

class RoadmapService {
  /**
   * Buscar roadmap com estatísticas de orçamento
   */
  async getRoadmapWithBudgetStats(userId, tripId) {
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
      
      const roadmap = {
        id: doc.id,
        ...tripData
      };
      
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