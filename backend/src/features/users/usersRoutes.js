const express = require('express');
const router = express.Router();
const usersController = require('./usersController');
const { authenticateUser } = require('../../middlewares/auth');
const { validate, userProfileUpdateSchema } = require('./usersValidation');

// Endpoint público para recuperação de senha
router.post('/auth/forgot-password', usersController.forgotPassword);

// Todas as rotas abaixo requerem autenticação
router.use(authenticateUser);

// Buscar perfil do usuário autenticado
router.get('/me', usersController.getProfile);

// Atualizar perfil do usuário autenticado
router.put('/me', validate(userProfileUpdateSchema), usersController.updateProfile);

// Logout do usuário autenticado
router.post('/logout', usersController.logout);

module.exports = router; 