const express = require('express');
const router = express.Router();
const sitePostsController = require('./sitePostsController');
const { authenticateUser, requirePartnerOrAdmin, requireAdmin } = require('../../middlewares/auth');
const { validate, sitePostSchema } = require('../../middlewares/validation');

// Rotas públicas (não requerem autenticação)
router.get('/public', sitePostsController.getPublicPosts);
router.get('/tags', sitePostsController.getPostsByTags);
router.get('/:postId', sitePostsController.getPost);

// Rotas que requerem autenticação
router.use(authenticateUser);

// Rotas para partners e admins
router.post('/', requirePartnerOrAdmin, validate(sitePostSchema), sitePostsController.createPost);
router.get('/user/posts', sitePostsController.getUserPosts);
router.put('/:postId', requirePartnerOrAdmin, validate(sitePostSchema), sitePostsController.updatePost);
router.delete('/:postId', requirePartnerOrAdmin, sitePostsController.deletePost);

// Rotas apenas para admins
router.get('/', requireAdmin, sitePostsController.getAllPosts);
router.get('/pending', requireAdmin, sitePostsController.getPendingPosts);
router.get('/stats', requireAdmin, sitePostsController.getPostsStats);
router.put('/:postId/approve', requireAdmin, sitePostsController.approvePost);
router.put('/:postId/reject', requireAdmin, sitePostsController.rejectPost);

module.exports = router; 