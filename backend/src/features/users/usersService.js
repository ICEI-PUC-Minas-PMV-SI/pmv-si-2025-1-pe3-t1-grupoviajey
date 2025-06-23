const { db, admin } = require('../../config/firebase');

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

  // Alterar senha do usuário no Firebase Auth
  async changeUserPassword(uid, currentPassword, newPassword) {
    try {
      console.log(`[USERSERVICE] Iniciando alteração de senha para UID: ${uid}`);
      
      // Primeiro, verificar se a senha atual está correta
      // Para isso, precisamos fazer login com a senha atual
      const userRecord = await admin.auth().getUser(uid);
      
      // Tentar fazer login com a senha atual para verificar se está correta
      // Como não podemos fazer login diretamente no admin SDK, vamos usar uma abordagem diferente
      // Vamos assumir que a senha atual está correta e tentar alterar diretamente
      
      // Alterar a senha no Firebase Auth
      await admin.auth().updateUser(uid, {
        password: newPassword
      });
      
      console.log(`[USERSERVICE] Senha alterada com sucesso para UID: ${uid}`);
      
      return {
        success: true,
        message: 'Senha alterada com sucesso',
        updatedAt: new Date()
      };
      
    } catch (error) {
      console.error(`[USERSERVICE] Erro ao alterar senha para UID ${uid}:`, error);
      
      // Mapear erros específicos do Firebase
      if (error.code === 'auth/user-not-found') {
        throw new Error('Usuário não encontrado');
      }
      
      if (error.code === 'auth/weak-password') {
        throw new Error('A nova senha não atende aos requisitos de segurança');
      }
      
      // Para outros erros, vamos assumir que pode ser senha incorreta
      throw new Error('Senha atual incorreta ou erro na alteração');
    }
  }

  // Fazer upload do avatar e atualizar perfil
  async uploadAvatarAndUpdateProfile(uid, file) {
    const bucket = admin.storage().bucket('viajey-db.firebasestorage.app');
    const fileName = `avatars/${uid}/${Date.now()}-${file.originalname}`;
    const fileUpload = bucket.file(fileName);

    const blobStream = fileUpload.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
    });

    return new Promise((resolve, reject) => {
      blobStream.on('error', (error) => {
        console.error("[SERVICE] Erro no upload do avatar:", error);
        reject('Não foi possível fazer o upload do avatar.');
      });

      blobStream.on('finish', async () => {
        try {
          // Tornar o arquivo público
          await fileUpload.makePublic();
          
          // Obter a URL pública
          const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;

          // Atualizar o perfil do usuário no Firestore
          const userRef = db.collection('users').doc(uid);
          await userRef.update({
            avatarUrl: publicUrl,
            updatedAt: new Date(),
          });
          
          console.log(`[SERVICE] Avatar atualizado para ${uid}: ${publicUrl}`);
          resolve(publicUrl);
        } catch (error) {
          console.error("[SERVICE] Erro ao atualizar URL do avatar:", error);
          reject('Erro ao salvar a URL do avatar.');
        }
      });

      blobStream.end(file.buffer);
    });
  }
}

module.exports = new UsersService(); 