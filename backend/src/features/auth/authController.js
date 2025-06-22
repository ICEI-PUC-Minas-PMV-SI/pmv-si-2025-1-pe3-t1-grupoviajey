const { admin } = require('../../config/firebase');
const authService = require('./authService');

class AuthController {
  // Cadastro de usuário
  async signup(req, res) {
    try {
      const { firstName, lastName, email, password, cpfCnpj, userType } = req.body;
      
      console.log(`[AUTH_CONTROLLER] Signup iniciado para: ${email}`);
      
      // Criar usuário no Firebase Auth
      const userRecord = await admin.auth().createUser({
        email,
        password,
        displayName: `${firstName} ${lastName}`
      });
      
      console.log(`[AUTH_CONTROLLER] Usuário criado no Auth: ${userRecord.uid}`);
      
      // Criar perfil no Firestore
      const userProfile = {
        firstName,
        lastName,
        email,
        cpfCnpj,
        userType,
        avatarUrl: '',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await authService.createUserProfile(userRecord.uid, userProfile);
      
      console.log(`[AUTH_CONTROLLER] Perfil criado no Firestore: ${userRecord.uid}`);
      
      // Gerar token customizado
      const customToken = await admin.auth().createCustomToken(userRecord.uid);
      
      res.status(201).json({
        success: true,
        message: 'Usuário criado com sucesso',
        data: {
          uid: userRecord.uid,
          email: userRecord.email,
          customToken
        }
      });
    } catch (error) {
      console.error('[AUTH_CONTROLLER] Erro no signup:', error);
      
      if (error.code === 'auth/email-already-exists') {
        return res.status(409).json({
          success: false,
          message: 'Email já está em uso'
        });
      }
      
      if (error.code === 'auth/invalid-email') {
        return res.status(400).json({
          success: false,
          message: 'Email inválido'
        });
      }
      
      if (error.code === 'auth/weak-password') {
        return res.status(400).json({
          success: false,
          message: 'Senha muito fraca. Use pelo menos 6 caracteres'
        });
      }
      
      res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
      });
    }
  }

  // Verificar token
  async verifyToken(req, res) {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          message: 'Token de autenticação não fornecido'
        });
      }

      const token = authHeader.split('Bearer ')[1];
      
      // Verificar token no Firebase Auth
      const decodedToken = await admin.auth().verifyIdToken(token);
      
      // Verificar se o usuário existe no Firestore
      const userProfile = await authService.getUserProfile(decodedToken.uid);
      
      if (!userProfile) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado no sistema'
        });
      }
      
      return res.status(200).json({
        success: true,
        message: 'Token válido',
        data: {
          uid: decodedToken.uid,
          email: decodedToken.email,
          userType: userProfile.userType
        }
      });
    } catch (error) {
      console.error('[AUTH_CONTROLLER] Erro na verificação do token:', error);
      return res.status(401).json({
        success: false,
        message: 'Token inválido ou expirado'
      });
    }
  }

  // Logout
  async logout(req, res) {
    try {
      const { uid } = req.user;
      
      console.log(`[AUTH_CONTROLLER] Logout para UID: ${uid}`);
      
      // Revogar refresh tokens
      await admin.auth().revokeRefreshTokens(uid);
      
      console.log(`[AUTH_CONTROLLER] Tokens revogados para UID: ${uid}`);
      
      res.status(200).json({
        success: true,
        message: 'Logout realizado com sucesso'
      });
    } catch (error) {
      console.error('[AUTH_CONTROLLER] Erro no logout:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao realizar logout'
      });
    }
  }
}

module.exports = new AuthController(); 