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
      res.status(200).json({ success: true, data: userProfile });
    } catch (error) {
      console.error('[USERCONTROLLER] Erro getProfile:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Recuperação de senha
  async forgotPassword(req, res) {
    const { email } = req.body;
    if (!email || typeof email !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Email é obrigatório e deve ser uma string válida.'
      });
    }
    try {
      // Gera o link de redefinição de senha
      const actionCodeSettings = {
        url: 'http://localhost:3001/pages/recuperar-senha/recuperar-senha.html',
        handleCodeInApp: false
      };
      const link = await admin.auth().generatePasswordResetLink(email, actionCodeSettings);
      // Aqui, o Firebase já envia o email automaticamente
      console.log(`[FORGOT_PASSWORD] Link de redefinição gerado para: ${email}`);
      console.log(`[FORGOT_PASSWORD] Link de redefinição: ${link}`);
      return res.status(200).json({
        success: true,
        message: 'Se o email estiver cadastrado, um link de redefinição foi enviado.'
      });
    } catch (error) {
      console.error('[FORGOT_PASSWORD] Erro ao enviar email de redefinição:', error, error.code, error.message);
      if (error.code === 'auth/user-not-found') {
        return res.status(404).json({
          success: false,
          message: 'Email não encontrado.'
        });
      }
      if (error.code === 'auth/invalid-email') {
        return res.status(400).json({
          success: false,
          message: 'Formato de email inválido.'
        });
      }
      return res.status(500).json({
        success: false,
        message: 'Erro ao enviar email de redefinição de senha. Tente novamente mais tarde.'
      });
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

  // Logout do usuário autenticado
  async logout(req, res) {
    const { uid } = req.user;
    try {
      console.log(`[LOGOUT] Revogando refresh tokens para UID: ${uid}`);
      await admin.auth().revokeRefreshTokens(uid);
      console.log(`[LOGOUT] Tokens revogados com sucesso para UID: ${uid}`);
      return res.status(200).json({ message: 'Logout realizado com sucesso' });
    } catch (error) {
      console.error(`[LOGOUT] Erro ao revogar tokens para UID: ${uid}`, error);
      return res.status(500).json({ message: 'Erro ao realizar logout', error: error.message });
    }
  }
}

module.exports = new UsersController(); 