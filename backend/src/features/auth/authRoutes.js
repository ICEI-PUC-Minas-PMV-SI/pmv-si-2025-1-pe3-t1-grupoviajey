const express = require('express');
const router = express.Router();
const authController = require('./authController');
const { validate, signupSchema } = require('./authValidation');
const { authenticateUser } = require('../../middlewares/auth');

// Endpoints públicos
router.post('/signup', validate(signupSchema), authController.signup);
router.get('/verify', authController.verifyToken);

// Endpoints que requerem autenticação
router.use(authenticateUser);
router.post('/logout', authController.logout);

module.exports = router; 