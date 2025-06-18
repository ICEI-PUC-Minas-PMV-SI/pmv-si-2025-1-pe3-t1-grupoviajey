const { auth } = require('../config/firebase');

/**
 * Middleware para autenticar usuários via Firebase Auth
 */
const authenticateUser = async (req, res, next) => {
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
    const decodedToken = await auth.verifyIdToken(token);
    
    // Adicionar informações do usuário ao request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      userType: decodedToken.userType || 'traveler' // Default para traveler
    };
    
    next();
  } catch (error) {
    console.error('Erro na autenticação:', error);
    return res.status(401).json({
      success: false,
      message: 'Token inválido ou expirado'
    });
  }
};

/**
 * Middleware para verificar se o usuário tem um tipo específico
 */
const requireUserType = (allowedTypes) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado'
      });
    }

    const userType = req.user.userType;
    
    if (!allowedTypes.includes(userType)) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado. Tipo de usuário não autorizado'
      });
    }
    
    next();
  };
};

/**
 * Middleware para verificar se o usuário é admin
 */
const requireAdmin = requireUserType(['admin']);

/**
 * Middleware para verificar se o usuário é partner ou admin
 */
const requirePartnerOrAdmin = requireUserType(['partner', 'admin']);

/**
 * Middleware para verificar se o usuário é traveler, partner ou admin
 */
const requireAnyUser = requireUserType(['traveler', 'partner', 'admin']);

module.exports = {
  authenticateUser,
  requireUserType,
  requireAdmin,
  requirePartnerOrAdmin,
  requireAnyUser
}; 