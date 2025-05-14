/**
 * Rotas de autenticação - Versão Simplificada
 * Reescrito do zero para eliminar problemas persistentes
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController.js.new');

// Registro de usuários
router.post('/register', authController.registrar);

// Login de usuários
router.post('/login', authController.login);

// Verificação de token
router.post('/verify', authController.verificarToken);

module.exports = router;