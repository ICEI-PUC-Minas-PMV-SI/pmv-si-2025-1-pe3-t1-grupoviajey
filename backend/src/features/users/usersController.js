const usersService = require('./usersService');
const { admin } = require('../../config/firebase');
const { userProfileCreateSchema, userProfileUpdateSchema } = require('./usersValidation');

class UsersController {
  // Buscar perfil do usuário autenticado
  async getProfile(req, res) {
    try {
      const { uid } = req.user;
      console.log(`[USERCONTROLLER] getProfile UID: ${uid}`);
      const userProfile = await usersService.getOrCreateUserProfile(uid, req.user);
      console.log(`[USERCONTROLLER] getProfile resultado:`, userProfile);
      
      // Verificar se o usuário tem perfil válido no Firestore
      if (!userProfile) {
        console.log(`[USERCONTROLLER] Usuário sem perfil no Firestore: ${uid}`);
        return res.status(404).json({ 
          success: false, 
          message: 'Usuário não encontrado no sistema. Por favor, faça o cadastro primeiro.' 
        });
      }
      
      res.status(200).json({ success: true, data: userProfile });
    } catch (error) {
      console.error('[USERCONTROLLER] Erro getProfile:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Atualizar perfil do usuário autenticado
  async updateProfile(req, res) {
    try {
      const { uid } = req.user;
      const updateData = req.body;
      console.log(`[USERCONTROLLER] updateProfile UID: ${uid}, body:`, updateData);
      // Verifica se o documento existe
      const userRef = require('../../config/firebase').db.collection('users').doc(uid);
      const doc = await userRef.get();
      if (!doc.exists) {
        // Validação de criação
        const { error } = userProfileCreateSchema.validate(updateData);
        if (error) {
          return res.status(400).json({
            success: false,
            message: 'Dados obrigatórios ausentes ou inválidos',
            errors: error.details.map(detail => detail.message)
          });
        }
      } else {
        // Validação de update
        const { error } = userProfileUpdateSchema.validate(updateData);
        if (error) {
          return res.status(400).json({
            success: false,
            message: 'Dados inválidos',
            errors: error.details.map(detail => detail.message)
          });
        }
      }
      const updatedProfile = await usersService.updateUserProfile(uid, updateData);
      console.log(`[USERCONTROLLER] updateProfile resultado:`, updatedProfile);
      res.status(200).json({ success: true, data: updatedProfile });
    } catch (error) {
      console.error('[USERCONTROLLER] Erro updateProfile:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // Fazer upload do avatar do usuário
  async uploadAvatar(req, res) {
    try {
      const { uid } = req.user;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ success: false, message: 'Nenhum arquivo de imagem enviado.' });
      }

      const avatarUrl = await usersService.uploadAvatarAndUpdateProfile(uid, file);
      
      res.status(200).json({ success: true, data: { avatarUrl } });
    } catch (error) {
      console.error('[USERCONTROLLER] Erro uploadAvatar:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Alterar senha do usuário autenticado
  async changePassword(req, res) {
    try {
      const { uid } = req.user;
      const { currentPassword, newPassword } = req.body;
      
      console.log(`[USERCONTROLLER] changePassword UID: ${uid}`);
      
      // Verificar se o usuário existe no Firestore
      const userRef = require('../../config/firebase').db.collection('users').doc(uid);
      const doc = await userRef.get();
      
      if (!doc.exists) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado no sistema.'
        });
      }

      // Alterar senha no Firebase Auth
      const result = await usersService.changeUserPassword(uid, currentPassword, newPassword);
      
      console.log(`[USERCONTROLLER] changePassword resultado:`, result);
      res.status(200).json({ 
        success: true, 
        message: 'Senha alterada com sucesso',
        data: result 
      });
    } catch (error) {
      console.error('[USERCONTROLLER] Erro changePassword:', error);
      
      if (error.code === 'auth/wrong-password') {
        return res.status(400).json({
          success: false,
          message: 'Senha atual incorreta'
        });
      }
      
      if (error.code === 'auth/weak-password') {
        return res.status(422).json({
          success: false,
          message: 'A nova senha não atende aos requisitos de segurança'
        });
      }
      
      res.status(500).json({ 
        success: false, 
        message: 'Erro interno do servidor ao alterar senha' 
      });
    }
  }

  // Listar usuários órfãos (existem no Auth mas não no Firestore) - APENAS PARA ADMIN
  async listOrphanUsers(req, res) {
    try {
      // Verificar se o usuário é admin
      if (req.user.userType !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Acesso negado. Apenas administradores podem acessar esta funcionalidade.'
        });
      }

      console.log('[ORPHAN_USERS] Iniciando busca por usuários órfãos...');
      
      // Listar todos os usuários do Firebase Auth
      const listUsersResult = await admin.auth().listUsers();
      const authUsers = listUsersResult.users;
      
      console.log(`[ORPHAN_USERS] Total de usuários no Auth: ${authUsers.length}`);
      
      const orphanUsers = [];
      
      // Verificar cada usuário do Auth no Firestore
      for (const authUser of authUsers) {
        const userRef = require('../../config/firebase').db.collection('users').doc(authUser.uid);
        const doc = await userRef.get();
        
        if (!doc.exists) {
          orphanUsers.push({
            uid: authUser.uid,
            email: authUser.email,
            displayName: authUser.displayName,
            createdAt: authUser.metadata.creationTime,
            lastSignIn: authUser.metadata.lastSignInTime
          });
        }
      }
      
      console.log(`[ORPHAN_USERS] Usuários órfãos encontrados: ${orphanUsers.length}`);
      
      res.status(200).json({
        success: true,
        data: orphanUsers,
        count: orphanUsers.length
      });
    } catch (error) {
      console.error('[ORPHAN_USERS] Erro ao listar usuários órfãos:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao listar usuários órfãos'
      });
    }
  }
}

module.exports = new UsersController(); 