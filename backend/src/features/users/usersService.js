const { db } = require('../../config/firebase');

class UsersService {
  // Busca ou cria o perfil do usuário no Firestore
  async getOrCreateUserProfile(uid, userAuthData) {
    const userRef = db.collection('users').doc(uid);
    const doc = await userRef.get();
    if (doc.exists) {
      console.log(`[USERSERVICE] Usuário já existe Firestore: ${uid}`);
      return { id: doc.id, ...doc.data() };
    }
    
    // Se o documento não existe, verificar se temos dados suficientes para criar
    // Só cria se todos os campos obrigatórios estiverem presentes e não vazios
    const requiredFields = ['firstName', 'lastName', 'cpfCnpj', 'userType', 'email'];
    const missing = requiredFields.filter(f => !userAuthData[f] || userAuthData[f].trim() === '');
    
    if (missing.length > 0) {
      console.warn(`[USERSERVICE] Usuário não encontrado no Firestore e dados insuficientes para criação: ${uid}, campos ausentes: ${missing.join(', ')}`);
      return null; // Retorna null para indicar que o usuário não existe
    }
    
    // Só chega aqui se todos os campos obrigatórios estiverem presentes
    const newUser = {
      firstName: userAuthData.firstName,
      lastName: userAuthData.lastName,
      email: userAuthData.email,
      cpfCnpj: userAuthData.cpfCnpj,
      userType: userAuthData.userType,
      avatarUrl: userAuthData.avatarUrl || userAuthData.avatarURL || '',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      password: '',
    };
    console.log(`[USERSERVICE] Criando novo usuário Firestore:`, newUser);
    await userRef.set(newUser);
    return { id: uid, ...newUser };
  }

  // Atualiza ou cria o perfil do usuário (upsert)
  async updateUserProfile(uid, updateData) {
    const userRef = db.collection('users').doc(uid);
    const doc = await userRef.get();
    const dataToSave = {
      firstName: updateData.firstName || '',
      lastName: updateData.lastName || '',
      email: updateData.email || '',
      cpfCnpj: updateData.cpfCnpj || '',
      userType: updateData.userType || 'traveler',
      avatarUrl: updateData.avatarUrl || updateData.avatarURL || '',
      isActive: typeof updateData.isActive === 'boolean' ? updateData.isActive : true,
      createdAt: doc.exists && doc.data().createdAt ? doc.data().createdAt : new Date(),
      updatedAt: new Date(),
      password: '',
    };
    if (!doc.exists) {
      console.log(`[USERSERVICE] Documento não existia, criando novo para UID: ${uid}`);
      await userRef.set(dataToSave);
    } else {
      console.log(`[USERSERVICE] Atualizando usuário Firestore UID: ${uid}`, dataToSave);
      await userRef.update(dataToSave);
    }
    const updatedDoc = await userRef.get();
    return { id: updatedDoc.id, ...updatedDoc.data() };
  }
}

module.exports = new UsersService(); 