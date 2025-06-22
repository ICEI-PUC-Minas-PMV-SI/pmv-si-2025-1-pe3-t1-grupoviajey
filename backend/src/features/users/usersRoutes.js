const express = require('express');
const router = express.Router();
const usersController = require('./usersController');
const { authenticateUser } = require('../../middlewares/auth');
const { validate, userProfileUpdateSchema } = require('./usersValidation');

// Todas as rotas abaixo requerem autenticação
router.use(authenticateUser);

// Buscar perfil do usuário autenticado
router.get('/me', usersController.getProfile);

// Atualizar perfil do usuário autenticado
router.put('/me', validate(userProfileUpdateSchema), usersController.updateProfile);

// Listar usuários órfãos (apenas para admin)
router.get('/orphan-users', usersController.listOrphanUsers);

module.exports = router; 