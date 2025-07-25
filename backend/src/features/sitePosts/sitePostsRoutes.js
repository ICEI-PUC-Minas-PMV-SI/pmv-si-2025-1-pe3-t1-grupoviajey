const express = require('express');
const router = express.Router();
const sitePostsController = require('./sitePostsController');
const { authenticateUser, requirePartnerOrAdmin, requireAdmin } = require('../../middlewares/auth');
const { validate, sitePostSchema } = require('../../middlewares/validation');

// Rotas públicas (não requerem autenticação)
router.get('/public', sitePostsController.getPublicPosts);

// Rotas que requerem autenticação
router.use(authenticateUser);

// Rotas para partners e admins
router.post('/', requirePartnerOrAdmin, validate(sitePostSchema), sitePostsController.createPost);

// Rotas apenas para admins
router.get('/', requireAdmin, sitePostsController.getAllPosts);
router.get('/pending', requireAdmin, sitePostsController.getPendingPosts);
router.get('/stats', requireAdmin, sitePostsController.getPostsStats);
router.put('/:postId/approve', requireAdmin, sitePostsController.approvePost);
router.put('/:postId/reject', requireAdmin, sitePostsController.rejectPost);

module.exports = router; 