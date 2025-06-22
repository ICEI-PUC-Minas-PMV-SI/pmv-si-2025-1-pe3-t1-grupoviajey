const express = require('express');
const router = express.Router();
const usersController = require('./usersController');
const { authenticateUser } = require('../../middlewares/auth');
const upload = require('../../middlewares/upload');
const { validate, userProfileUpdateSchema, changePasswordSchema } = require('./usersValidation');

// Todas as rotas abaixo requerem autenticação
router.use(authenticateUser);

// Buscar perfil do usuário autenticado
router.get('/me', usersController.getProfile);

// Atualizar perfil do usuário autenticado
router.put('/me', validate(userProfileUpdateSchema), usersController.updateProfile);

// Fazer upload do avatar do usuário
router.post('/me/avatar', upload.single('avatar'), usersController.uploadAvatar);

// Alterar senha do usuário autenticado
router.put('/change-password', validate(changePasswordSchema), usersController.changePassword);

// Listar usuários órfãos (apenas para admin)
router.get('/orphan-users', usersController.listOrphanUsers);

module.exports = router; 