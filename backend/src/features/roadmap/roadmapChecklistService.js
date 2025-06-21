const { db } = require('../../config/firebase');

class RoadmapChecklistService {
  /**
   * Criar checklist para um roadmap
   */
  async createRoadmapChecklist(userId, tripId, checklistData) {
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

      const checklistRef = db
        .collection('trips')
        .doc(tripId)
        .collection('tripChecklist');

      const checklist = {
        ...checklistData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const docRef = await checklistRef.add(checklist);
      
      return {
        id: docRef.id,
        ...checklist
      };
    } catch (error) {
      throw new Error(`Erro ao criar checklist: ${error.message}`);
    }
  }

  /**
   * Buscar todos os checklists de um roadmap
   */
  async getRoadmapChecklists(userId, tripId) {
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

      const checklistRef = db
        .collection('trips')
        .doc(tripId)
        .collection('tripChecklist');

      const snapshot = await checklistRef.orderBy('createdAt', 'desc').get();
      
      const checklists = [];
      snapshot.forEach(doc => {
        checklists.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return checklists;
    } catch (error) {
      throw new Error(`Erro ao buscar checklists: ${error.message}`);
    }
  }

  /**
   * Buscar checklist específico
   */
  async getRoadmapChecklist(userId, tripId, checklistId) {
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

      const checklistRef = db
        .collection('trips')
        .doc(tripId)
        .collection('tripChecklist')
        .doc(checklistId);

      const doc = await checklistRef.get();
      
      if (!doc.exists) {
        throw new Error('Checklist não encontrado');
      }
      
      return {
        id: doc.id,
        ...doc.data()
      };
    } catch (error) {
      throw new Error(`Erro ao buscar checklist: ${error.message}`);
    }
  }

  /**
   * Atualizar checklist
   */
  async updateRoadmapChecklist(userId, tripId, checklistId, updateData) {
    try {
      // Verificar se o usuário tem acesso à trip
      const tripRef = db.collection('trips').doc(tripId);
      const tripDoc = await tripRef.get();
      
      if (!tripDoc.exists) {
        throw new Error('Viagem não encontrada');
      }
      
      const tripData = tripDoc.data();
      if (tripData.ownerId !== userId && !tripData.collaborators.includes(userId)) {
        throw new Error('Acesso negado: você não tem permissão para editar esta viagem');
      }

      const checklistRef = db
        .collection('trips')
        .doc(tripId)
        .collection('tripChecklist')
        .doc(checklistId);

      const update = {
        ...updateData,
        updatedAt: new Date()
      };

      await checklistRef.update(update);
      
      return await this.getRoadmapChecklist(userId, tripId, checklistId);
    } catch (error) {
      throw new Error(`Erro ao atualizar checklist: ${error.message}`);
    }
  }

  /**
   * Deletar checklist
   */
  async deleteRoadmapChecklist(userId, tripId, checklistId) {
    try {
      // Verificar se o usuário tem acesso à trip
      const tripRef = db.collection('trips').doc(tripId);
      const tripDoc = await tripRef.get();
      
      if (!tripDoc.exists) {
        throw new Error('Viagem não encontrada');
      }
      
      const tripData = tripDoc.data();
      if (tripData.ownerId !== userId && !tripData.collaborators.includes(userId)) {
        throw new Error('Acesso negado: você não tem permissão para editar esta viagem');
      }

      const checklistRef = db
        .collection('trips')
        .doc(tripId)
        .collection('tripChecklist')
        .doc(checklistId);

      const doc = await checklistRef.get();
      if (!doc.exists) {
        throw new Error('Checklist não encontrado');
      }

      await checklistRef.delete();
      
      return { success: true, message: 'Checklist deletado com sucesso' };
    } catch (error) {
      throw new Error(`Erro ao deletar checklist: ${error.message}`);
    }
  }

  /**
   * Atualizar status de um item do checklist
   */
  async updateChecklistItem(userId, tripId, checklistId, itemData) {
    try {
      const checklist = await this.getRoadmapChecklist(userId, tripId, checklistId);
      
      if (!checklist.items || !Array.isArray(checklist.items)) {
        throw new Error('Checklist não possui itens');
      }

      const { itemId, ...updateData } = itemData;
      
      // Encontrar o item pelo ID
      const itemIndex = checklist.items.findIndex(item => item.id === itemId);
      if (itemIndex === -1) {
        throw new Error('Item não encontrado');
      }

      // Atualizar o item específico
      const updatedItems = [...checklist.items];
      updatedItems[itemIndex] = {
        ...updatedItems[itemIndex],
        ...updateData,
        updatedAt: new Date()
      };

      const updateDataForChecklist = {
        items: updatedItems
      };

      return await this.updateRoadmapChecklist(userId, tripId, checklistId, updateDataForChecklist);
    } catch (error) {
      throw new Error(`Erro ao atualizar item do checklist: ${error.message}`);
    }
  }

  /**
   * Adicionar item ao checklist
   */
  async addChecklistItem(userId, tripId, checklistId, itemData) {
    try {
      const checklist = await this.getRoadmapChecklist(userId, tripId, checklistId);
      
      const currentItems = checklist.items || [];
      const newItem = {
        id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        text: itemData.text,
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const updatedItems = [...currentItems, newItem];
      const updateData = {
        items: updatedItems
      };

      await this.updateRoadmapChecklist(userId, tripId, checklistId, updateData);
      
      return newItem;
    } catch (error) {
      throw new Error(`Erro ao adicionar item ao checklist: ${error.message}`);
    }
  }

  /**
   * Remover item do checklist
   */
  async removeChecklistItem(userId, tripId, checklistId, itemData) {
    try {
      const checklist = await this.getRoadmapChecklist(userId, tripId, checklistId);
      
      if (!checklist.items || !Array.isArray(checklist.items)) {
        throw new Error('Checklist não possui itens');
      }

      const { itemId } = itemData;
      
      // Encontrar o item pelo ID
      const itemIndex = checklist.items.findIndex(item => item.id === itemId);
      if (itemIndex === -1) {
        throw new Error('Item não encontrado');
      }

      // Remover o item específico
      const updatedItems = checklist.items.filter(item => item.id !== itemId);
      const updateData = {
        items: updatedItems
      };

      await this.updateRoadmapChecklist(userId, tripId, checklistId, updateData);
      
      return { success: true, message: 'Item removido do checklist com sucesso' };
    } catch (error) {
      throw new Error(`Erro ao remover item do checklist: ${error.message}`);
    }
  }
}

module.exports = new RoadmapChecklistService(); 