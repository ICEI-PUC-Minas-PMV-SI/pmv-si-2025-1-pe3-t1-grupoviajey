const { db } = require('../../config/firebase');

class AuthService {
  // Criar perfil de usuário no Firestore
  async createUserProfile(uid, userProfile) {
    try {
      const userRef = db.collection('users').doc(uid);
      await userRef.set(userProfile);
      
      console.log(`[AUTH_SERVICE] Perfil criado no Firestore: ${uid}`);
      return userProfile;
    } catch (error) {
      console.error(`[AUTH_SERVICE] Erro ao criar perfil: ${uid}`, error);
      throw new Error('Erro ao criar perfil do usuário');
    }
  }

  // Buscar perfil de usuário no Firestore
  async getUserProfile(uid) {
    try {
      const userRef = db.collection('users').doc(uid);
      const doc = await userRef.get();
      
      if (!doc.exists) {
        return null;
      }
      
      return doc.data();
    } catch (error) {
      console.error(`[AUTH_SERVICE] Erro ao buscar perfil: ${uid}`, error);
      throw new Error('Erro ao buscar perfil do usuário');
    }
  }

  // Atualizar perfil de usuário no Firestore
  async updateUserProfile(uid, updateData) {
    try {
      const userRef = db.collection('users').doc(uid);
      const updatePayload = {
        ...updateData,
        updatedAt: new Date()
      };
      
      await userRef.update(updatePayload);
      
      // Buscar dados atualizados
      const doc = await userRef.get();
      return doc.data();
    } catch (error) {
      console.error(`[AUTH_SERVICE] Erro ao atualizar perfil: ${uid}`, error);
      throw new Error('Erro ao atualizar perfil do usuário');
    }
  }
}

module.exports = new AuthService(); 